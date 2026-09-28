"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, History, Pencil, Star, Trash2 } from "lucide-react";
import { RawMaterial, MaterialSupplier, UNIT_LABELS } from "@/types";
import { formatCurrency } from "@/lib/format";
import {
  useRemoveMaterialSupplier,
  useSetDefaultMaterialSupplier,
} from "@/hooks/use-raw-materials";
import { AddSupplierDialog } from "./add-supplier-dialog";
import { EditSupplierDialog } from "./edit-supplier-dialog";
import { SupplierPriceHistoryDialog } from "./supplier-price-history-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rawMaterial: RawMaterial | null;
}

export function ManageSuppliersDialog({ open, onOpenChange, rawMaterial }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<MaterialSupplier | null>(null);
  const [historyEntry, setHistoryEntry] = useState<MaterialSupplier | null>(null);
  const [removeEntry, setRemoveEntry] = useState<MaterialSupplier | null>(null);

  const removeMutation = useRemoveMaterialSupplier();
  const setDefaultMutation = useSetDefaultMaterialSupplier();

  if (!rawMaterial) return null;

  const suppliers = rawMaterial.suppliers ?? [];

  const handleSetDefault = async (entry: MaterialSupplier) => {
    await setDefaultMutation.mutateAsync({
      materialId: rawMaterial.id,
      supplierEntryId: entry.id,
    });
  };

  const handleConfirmRemove = async () => {
    if (!removeEntry) return;
    await removeMutation.mutateAsync({
      materialId: rawMaterial.id,
      supplierEntryId: removeEntry.id,
    });
    setRemoveEntry(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fornecedores — {rawMaterial.name}</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-slate-500">
            O fornecedor marcado como padrão é usado para calcular o custo
            desse material nos seus produtos. Você pode cadastrar fornecedores
            alternativos para comparar preços ou usar como plano B.
          </p>

          <div className="space-y-3">
            {suppliers.length === 0 && (
              <p className="rounded-md border border-dashed p-4 text-center text-sm text-slate-500">
                Nenhum fornecedor cadastrado ainda.
              </p>
            )}

            {suppliers.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{entry.supplier.name}</p>
                    {entry.isDefault && (
                      <Badge className="bg-emerald-100 text-emerald-800">
                        Padrão
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {formatCurrency(entry.purchasePrice)} por{" "}
                    {entry.purchaseQty}{" "}
                    {UNIT_LABELS[entry.purchaseUnit]?.toLowerCase()}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Ver histórico de preços"
                    onClick={() => setHistoryEntry(entry)}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Editar preço/quantidade"
                    onClick={() => setEditEntry(entry)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {!entry.isDefault && (
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Definir como padrão"
                      onClick={() => handleSetDefault(entry)}
                      disabled={setDefaultMutation.isPending}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Remover fornecedor"
                    onClick={() => setRemoveEntry(entry)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar fornecedor
          </Button>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddSupplierDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        materialId={rawMaterial.id}
      />

      <EditSupplierDialog
        open={!!editEntry}
        onOpenChange={(v) => !v && setEditEntry(null)}
        materialId={rawMaterial.id}
        entry={editEntry}
      />

      <SupplierPriceHistoryDialog
        open={!!historyEntry}
        onOpenChange={(v) => !v && setHistoryEntry(null)}
        materialId={rawMaterial.id}
        entry={historyEntry}
      />

      <AlertDialog open={!!removeEntry} onOpenChange={(v) => !v && setRemoveEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover fornecedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover &quot;{removeEntry?.supplier.name}
              &quot; desta matéria-prima? O histórico de preços será mantido,
              apenas a oferta será removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}