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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MaterialSupplier, UNIT_LABELS, UnitOfMeasure } from "@/types";
import { useUpdateMaterialSupplier } from "@/hooks/use-raw-materials";

const unitValues = Object.keys(UNIT_LABELS) as [
  UnitOfMeasure,
  ...UnitOfMeasure[]
];

const schema = z.object({
  purchaseUnit: z.enum(unitValues),
  purchaseQty: z.coerce.number().positive("Deve ser um valor positivo"),
  purchasePrice: z.coerce.number().nonnegative("Não pode ser negativo"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string;
  entry: MaterialSupplier | null;
}

export function EditSupplierDialog({ open, onOpenChange, materialId, entry }: Props) {
  const updateMutation = useUpdateMaterialSupplier();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      purchaseUnit: "M",
      purchaseQty: 1,
      purchasePrice: 0,
    },
  });

  useEffect(() => {
    if (open && entry) {
      reset({
        purchaseUnit: entry.purchaseUnit,
        purchaseQty: entry.purchaseQty,
        purchasePrice: entry.purchasePrice,
      });
    }
  }, [open, entry, reset]);

  if (!entry) return null;

  const onSubmit = async (values: FormValues) => {
    await updateMutation.mutateAsync({
      materialId,
      supplierEntryId: entry.id,
      payload: values,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar — {entry.supplier.name}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-slate-500">
          Se você alterar o preço, o valor anterior é guardado automaticamente
          no histórico dessa matéria-prima com esse fornecedor.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="purchaseQty">Quantidade *</Label>
              <Input
                id="purchaseQty"
                type="number"
                step="any"
                {...register("purchaseQty")}
              />
              {errors.purchaseQty && (
                <p className="text-sm text-red-600">
                  {errors.purchaseQty.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Unidade *</Label>
              <Controller
                name="purchaseUnit"
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
              <Label htmlFor="purchasePrice">Preço (R$) *</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="any"
                {...register("purchasePrice")}
              />
              {errors.purchasePrice && (
                <p className="text-sm text-red-600">
                  {errors.purchasePrice.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}