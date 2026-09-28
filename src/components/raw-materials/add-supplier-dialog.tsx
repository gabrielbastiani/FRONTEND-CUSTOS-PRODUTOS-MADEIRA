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
import { Skeleton } from "@/components/ui/skeleton";
import { UNIT_LABELS, UnitOfMeasure } from "@/types";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useAddMaterialSupplier } from "@/hooks/use-raw-materials";
import { Checkbox } from "../ui/checkbox";

const unitValues = Object.keys(UNIT_LABELS) as [
  UnitOfMeasure,
  ...UnitOfMeasure[]
];

const schema = z.object({
  supplierId: z.string().min(1, "Selecione um fornecedor"),
  purchaseUnit: z.enum(unitValues),
  purchaseQty: z.coerce.number().positive("Deve ser um valor positivo"),
  purchasePrice: z.coerce.number().nonnegative("Não pode ser negativo"),
  isDefault: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string;
}

export function AddSupplierDialog({ open, onOpenChange, materialId }: Props) {
  const { data: suppliers, isLoading: loadingSuppliers } = useSuppliers();
  const addMutation = useAddMaterialSupplier();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      supplierId: "",
      purchaseUnit: "M",
      purchaseQty: 1,
      purchasePrice: 0,
      isDefault: false,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        supplierId: "",
        purchaseUnit: "M",
        purchaseQty: 1,
        purchasePrice: 0,
        isDefault: false,
      });
    }
  }, [open, reset]);

  const onSubmit = async (values: FormValues) => {
    await addMutation.mutateAsync({ materialId, payload: values });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar fornecedor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Fornecedor *</Label>
            {loadingSuppliers ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Controller
                name="supplierId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            {errors.supplierId && (
              <p className="text-sm text-red-600">{errors.supplierId.message}</p>
            )}
          </div>

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

          <div className="flex items-center gap-2">
            <Controller
              name="isDefault"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="isDefault"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="isDefault">Definir como fornecedor padrão</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}