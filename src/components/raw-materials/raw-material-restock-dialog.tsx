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
import { useRestockRawMaterial } from "@/hooks/use-raw-materials";
import { formatNumber } from "@/lib/format";

const schema = z.object({
  quantity: z.coerce.number().positive("Informe uma quantidade positiva"),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rawMaterial: RawMaterial | null;
}

export function RawMaterialRestockDialog({ open, onOpenChange, rawMaterial }: Props) {
  const restockMutation = useRestockRawMaterial();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: undefined, note: "" },
  });

  useEffect(() => {
    if (open) reset({ quantity: undefined, note: "" });
  }, [open, reset]);

  if (!rawMaterial) return null;

  const usageLabel = UNIT_LABELS[rawMaterial.usageUnit]?.toLowerCase();

  const onSubmit = async (values: FormValues) => {
    await restockMutation.mutateAsync({
      id: rawMaterial.id,
      quantity: values.quantity,
      note: values.note || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Repor estoque — {rawMaterial.name}</DialogTitle>
        </DialogHeader>

        <SectionIntro>
          Use esta tela sempre que comprar mais desse material e quiser que o sistema
          saiba que ele está disponível para uso na produção. O estoque atual é
          somado à quantidade que você informar aqui.
        </SectionIntro>

        <div className="rounded-md border bg-slate-50 p-3 text-sm text-slate-700">
          Estoque atual: <strong>{formatNumber(rawMaterial.stockQty)} {usageLabel}</strong>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantidade recebida ({usageLabel}) *
            </Label>
            <Input
              id="quantity"
              type="number"
              step="any"
              {...register("quantity")}
              placeholder={`Ex: 540 (equivalente a 5,4 metros, se a unidade de uso for cm)`}
            />
            <FieldHint>
              Informe a quantidade já convertida para a unidade de uso ({usageLabel}),
              não na unidade de compra. Se você comprou 5,4 metros de tábua e a
              unidade de uso é centímetro, informe 540.
            </FieldHint>
            {errors.quantity && (
              <p className="text-sm text-red-600">{errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Observação (opcional)</Label>
            <Textarea id="note" {...register("note")} rows={2} placeholder="Ex: Compra na Madeireira Silva, nota 1234" />
            <FieldHint>
              Útil para lembrar depois de onde veio esse lote, caso precise conferir
              o histórico de movimentações.
            </FieldHint>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={restockMutation.isPending}>
              {restockMutation.isPending ? "Registrando..." : "Confirmar entrada"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}