"use client"

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
import { Skeleton } from "@/components/ui/skeleton";
import { FieldHint } from "@/components/ui/field-hint";
import { SectionIntro } from "@/components/ui/section-intro";
import { ImageUploader } from "@/components/shared/image-uploader";
import { RawMaterial, UNIT_LABELS, UnitOfMeasure } from "@/types";
import { useSuppliers } from "@/hooks/use-suppliers";
import {
  useCreateRawMaterial,
  useUpdateRawMaterial,
} from "@/hooks/use-raw-materials";
import { formatCurrency } from "@/lib/format";

const unitValues = Object.keys(UNIT_LABELS) as [
  UnitOfMeasure,
  ...UnitOfMeasure[],
];

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  description: z.string().optional(),
  supplierId: z.string().optional(),
  purchaseUnit: z.enum(unitValues),
  purchaseQty: z.coerce.number().positive("Deve ser um valor positivo"),
  purchasePrice: z.coerce.number().nonnegative("Não pode ser negativo"),
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

const NO_SUPPLIER_VALUE = "__none__";

export function RawMaterialFormDialog({
  open,
  onOpenChange,
  rawMaterial,
}: Props) {
  const isEditing = !!rawMaterial;
  const { data: suppliers, isLoading: loadingSuppliers } = useSuppliers();
  const createMutation = useCreateRawMaterial();
  const updateMutation = useUpdateRawMaterial();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      supplierId: NO_SUPPLIER_VALUE,
      purchaseUnit: "M",
      purchaseQty: 1,
      purchasePrice: 0,
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
        supplierId: rawMaterial.supplierId ?? NO_SUPPLIER_VALUE,
        purchaseUnit: rawMaterial.purchaseUnit,
        purchaseQty: rawMaterial.purchaseQty,
        purchasePrice: rawMaterial.purchasePrice,
        usageUnit: rawMaterial.usageUnit,
        conversionFactor: rawMaterial.conversionFactor,
        minStockAlert: rawMaterial.minStockAlert ?? undefined,
      });
    } else {
      reset({
        name: "",
        description: "",
        supplierId: NO_SUPPLIER_VALUE,
        purchaseUnit: "M",
        purchaseQty: 1,
        purchasePrice: 0,
        usageUnit: "CM",
        conversionFactor: 100,
        minStockAlert: undefined,
      });
    }
  }, [rawMaterial, reset, open]);

  const purchaseQty = watch("purchaseQty");
  const purchasePrice = watch("purchasePrice");
  const conversionFactor = watch("conversionFactor");
  const usageUnit = watch("usageUnit");

  const totalUsageUnits = (purchaseQty || 0) * (conversionFactor || 0);
  const unitCost =
    totalUsageUnits > 0 ? (purchasePrice || 0) / totalUsageUnits : 0;

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      supplierId:
        !values.supplierId || values.supplierId === NO_SUPPLIER_VALUE
          ? undefined
          : values.supplierId,
    };

    if (isEditing && rawMaterial) {
      await updateMutation.mutateAsync({ id: rawMaterial.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
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
          Matéria-prima é qualquer material que você compra e consome na fabricação dos
          seus produtos, como madeira, cola, verniz ou parafusos. Esse cadastro existe
          para que o sistema saiba exatamente quanto custa cada material por unidade de
          uso (por exemplo, por centímetro ou por grama), permitindo calcular o custo
          real de cada produto que você fabrica com precisão.
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
              Dê um nome claro e específico, que te ajude a identificar rapidamente
              esse material entre outros parecidos, incluindo detalhes como espessura,
              cor ou tipo, quando fizer diferença.
            </FieldHint>
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register("description")} rows={2} />
            <FieldHint>
              Campo opcional para anotar detalhes extras, como marca, fornecedor
              preferencial ou observações sobre qualidade. Não entra em nenhum cálculo.
            </FieldHint>
          </div>

          <div className="space-y-2">
            <Label>Fornecedor</Label>
            {loadingSuppliers ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Controller
                name="supplierId"
                control={control}
                render={({ field }) => (
                  <Select
                    key={`supplier-${field.value ?? "none"}-${suppliers?.length ?? 0}`}
                    value={field.value || NO_SUPPLIER_VALUE}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um fornecedor (opcional)">
                        {() =>
                          field.value && field.value !== NO_SUPPLIER_VALUE
                            ? suppliers?.find((s) => s.id === field.value)?.name ?? ""
                            : "Nenhum fornecedor"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_SUPPLIER_VALUE}>
                        Nenhum fornecedor
                      </SelectItem>
                      {suppliers?.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            <FieldHint>
              Vincular um fornecedor é opcional, mas ajuda a rastrear de onde você
              costuma comprar esse material, útil para comparar preços ou renegociar
              no futuro. Cadastre fornecedores na aba &quot;Fornecedores&quot;.
            </FieldHint>
          </div>

          <div className="rounded-md border bg-slate-50 p-4">
            <p className="mb-1 text-sm font-medium text-slate-700">
              Como foi comprado
            </p>
            <FieldHint className="mb-3">
              Informe os dados exatamente como está na nota fiscal ou no pacote que
              você comprou. Por exemplo, se você comprou uma peça de madeira de 3
              metros por R$45, a quantidade comprada é 3, a unidade é metro (M) e o
              preço pago é R$45.
            </FieldHint>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="purchaseQty">Quantidade comprada *</Label>
                <Input
                  id="purchaseQty"
                  type="number"
                  step="any"
                  {...register("purchaseQty")}
                  placeholder="Ex: 3"
                />
                <FieldHint>
                  Quantas unidades de compra vieram no lote que você adquiriu.
                </FieldHint>
                {errors.purchaseQty && (
                  <p className="text-sm text-red-600">
                    {errors.purchaseQty.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Unidade de compra *</Label>
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
                <FieldHint>
                  A unidade em que o material é vendido pelo fornecedor (metro,
                  quilo, unidade, litro etc.).
                </FieldHint>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Preço pago (R$) *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="any"
                  {...register("purchasePrice")}
                  placeholder="Ex: 45.00"
                />
                <FieldHint>
                  Valor total pago por essa quantidade comprada, não o preço por
                  unidade de uso — o sistema calcula isso para você.
                </FieldHint>
                {errors.purchasePrice && (
                  <p className="text-sm text-red-600">
                    {errors.purchasePrice.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-md border bg-slate-50 p-4">
            <p className="mb-1 text-sm font-medium text-slate-700">
              Como é usado na produção
            </p>
            <FieldHint className="mb-3">
              Aqui você define a unidade menor em que o material é efetivamente
              consumido ao fabricar um produto. Isso permite calcular o custo exato
              de, por exemplo, 80cm de tábua, mesmo tendo comprado em metros.
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
                <FieldHint>
                  Unidade menor usada na hora de montar um produto (ex: centímetro
                  para madeira cortada, grama para cola, mililitro para verniz).
                </FieldHint>
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
                <FieldHint>
                  Fator de conversão entre a unidade de compra e a de uso. Se você
                  compra em metros e usa em centímetros, o valor é 100, pois 1
                  metro equivale a 100 centímetros.
                </FieldHint>
                {errors.conversionFactor && (
                  <p className="text-sm text-red-600">
                    {errors.conversionFactor.message}
                  </p>
                )}
              </div>
            </div>

            {totalUsageUnits > 0 && (
              <div className="mt-3 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
                Custo calculado: <strong>{formatCurrency(unitCost)}</strong> por{" "}
                {UNIT_LABELS[usageUnit]?.toLowerCase()}
                <FieldHint className="mt-1 text-emerald-700">
                  Esse é o valor que o sistema vai usar automaticamente sempre que
                  você adicionar essa matéria-prima a um produto.
                </FieldHint>
              </div>
            )}
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
              Defina uma quantidade mínima (na unidade de uso) para receber um
              aviso visual quando o estoque desse material estiver acabando.
              Deixe em branco se não quiser controlar estoque para esse item.
            </FieldHint>
          </div>

          <div className="space-y-2">
            <Label>Imagens</Label>
            <FieldHint>
              Adicione fotos de referência, opcional. Útil para identificar
              visualmente o item rapidamente na hora de montar um produto.
            </FieldHint>
            <ImageUploader ownerType="raw-materials" ownerId={rawMaterial?.id} />
          </div>

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