"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldHint } from "@/components/ui/field-hint";
import { SectionIntro } from "@/components/ui/section-intro";
import { RawMaterial, UNIT_LABELS } from "@/types";
import { useAdjustRawMaterialStock } from "@/hooks/use-raw-materials";
import { formatNumber } from "@/lib/format";

const schema = z.object({
  quantity: z.coerce.number().refine((v) => v !== 0, "Informe um valor diferente de zero"),
  note: z.string().min(1, "Informe o motivo do ajuste"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rawMaterial: RawMaterial | null;
}

export function RawMaterialAdjustStockDialog({ open, onOpenChange, rawMaterial }: Props) {
  const adjustMutation = useAdjustRawMaterialStock();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: undefined, note: "" },
  });

  useEffect(() => {
    if (open) reset({ quantity: undefined, note: "" });
  }, [open, reset]);

  const quantity = watch("quantity");

  if (!rawMaterial) return null;

  const usageLabel = UNIT_LABELS[rawMaterial.usageUnit]?.toLowerCase();
  const resultingStock = rawMaterial.stockQty + (Number(quantity) || 0);

  const onSubmit = async (values: FormValues) => {
    await adjustMutation.mutateAsync({
      id: rawMaterial.id,
      quantity: values.quantity,
      note: values.note,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar estoque — {rawMaterial.name}</DialogTitle>
        </DialogHeader>

        <SectionIntro>
          Use esta tela para corrigir o estoque quando ele estiver diferente do que
          você conferiu fisicamente, por perda, quebra ou erro anterior de
          digitação. Informe a diferença: um valor positivo soma ao estoque atual,
          um valor negativo subtrai.
        </SectionIntro>

        <div className="rounded-md border bg-slate-50 p-3 text-sm text-slate-700">
          Estoque atual: <strong>{formatNumber(rawMaterial.stockQty)} {usageLabel}</strong>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Diferença a aplicar ({usageLabel}) *
            </Label>
            <Input
              id="quantity"
              type="number"
              step="any"
              {...register("quantity")}
              placeholder="Ex: -20 para remover, 20 para adicionar"
            />
            <FieldHint>
              Use valor negativo para remover do estoque (ex: -20) e valor positivo
              para adicionar (ex: 20), na unidade de uso ({usageLabel}).
            </FieldHint>
            {errors.quantity && (
              <p className="text-sm text-red-600">{errors.quantity.message}</p>
            )}
            {quantity !== undefined && quantity !== null && !isNaN(Number(quantity)) && (
              <p className="text-xs text-slate-500">
                Estoque resultante: <strong>{formatNumber(resultingStock)} {usageLabel}</strong>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Motivo do ajuste *</Label>
            <Textarea
              id="note"
              {...register("note")}
              rows={2}
              placeholder="Ex: Contagem física encontrou menos do que o sistema, provável perda"
            />
            <FieldHint>
              Obrigatório informar o motivo, para manter rastreável por que o
              estoque mudou fora do fluxo normal de reposição ou produção.
            </FieldHint>
            {errors.note && (
              <p className="text-sm text-red-600">{errors.note.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={adjustMutation.isPending}>
              {adjustMutation.isPending ? "Ajustando..." : "Confirmar ajuste"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}