"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldHint } from "@/components/ui/field-hint";
import { SectionIntro } from "@/components/ui/section-intro";
import { RawMaterial, UNIT_LABELS, UnitOfMeasure } from "@/types";
import {
  useCreateRawMaterial,
  useUpdateRawMaterial,
} from "@/hooks/use-raw-materials";

const unitValues = Object.keys(UNIT_LABELS) as [
  UnitOfMeasure,
  ...UnitOfMeasure[]
];

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  description: z.string().optional(),
  usageUnit: z.enum(unitValues),
  conversionFactor: z.coerce.number().positive("Deve ser um valor positivo"),
  minStockAlert: z.coerce.number().nonnegative().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rawMaterial?: RawMaterial | null;
}

export function RawMaterialFormDialog({
  open,
  onOpenChange,
  rawMaterial,
}: Props) {
  const isEditing = !!rawMaterial;
  const createMutation = useCreateRawMaterial();
  const updateMutation = useUpdateRawMaterial();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      usageUnit: "CM",
      conversionFactor: 100,
      minStockAlert: undefined,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (rawMaterial) {
      reset({
        name: rawMaterial.name,
        description: rawMaterial.description ?? "",
        usageUnit: rawMaterial.usageUnit,
        conversionFactor: rawMaterial.conversionFactor,
        minStockAlert: rawMaterial.minStockAlert ?? undefined,
      });
    } else {
      reset({
        name: "",
        description: "",
        usageUnit: "CM",
        conversionFactor: 100,
        minStockAlert: undefined,
      });
    }
  }, [rawMaterial, reset, open]);

  const onSubmit = async (values: FormValues) => {
    if (isEditing && rawMaterial) {
      await updateMutation.mutateAsync({ id: rawMaterial.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar matéria-prima" : "Nova matéria-prima"}
          </DialogTitle>
        </DialogHeader>

        <SectionIntro>
          Matéria-prima é qualquer material que você compra e consome na
          fabricação dos seus produtos, como madeira, cola, verniz ou
          parafusos. Depois de salvar, você vai gerenciar os fornecedores e
          preços desse material na tela de fornecedores.
        </SectionIntro>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ex: Tábua de Pinus 20cm"
            />
            <FieldHint>
              Dê um nome claro e específico, que te ajude a identificar
              rapidamente esse material entre outros parecidos.
            </FieldHint>
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register("description")} rows={2} />
            <FieldHint>
              Campo opcional para anotar detalhes extras. Não entra em nenhum
              cálculo.
            </FieldHint>
          </div>

          <div className="rounded-md border bg-slate-50 p-4">
            <p className="mb-1 text-sm font-medium text-slate-700">
              Como é usado na produção
            </p>
            <FieldHint className="mb-3">
              Defina a unidade menor em que o material é consumido ao
              fabricar um produto.
            </FieldHint>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Unidade de uso *</Label>
                <Controller
                  name="usageUnit"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue>
                          {() => UNIT_LABELS[field.value as UnitOfMeasure] ?? ""}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(UNIT_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conversionFactor">
                  Quantas unidades de uso equivalem a 1 unidade de compra? *
                </Label>
                <Input
                  id="conversionFactor"
                  type="number"
                  step="any"
                  {...register("conversionFactor")}
                  placeholder="Ex: 100 (1 metro = 100 cm)"
                />
                {errors.conversionFactor && (
                  <p className="text-sm text-red-600">
                    {errors.conversionFactor.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minStockAlert">
              Alerta de estoque mínimo (opcional)
            </Label>
            <Input
              id="minStockAlert"
              type="number"
              step="any"
              {...register("minStockAlert")}
            />
            <FieldHint>
              Quantidade mínima (na unidade de uso) para receber um aviso
              quando o estoque estiver acabando.
            </FieldHint>
          </div>

          {!isEditing && (
            <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              Depois de salvar, você vai cadastrar o primeiro fornecedor e
              preço desse material na tela de fornecedores.
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}