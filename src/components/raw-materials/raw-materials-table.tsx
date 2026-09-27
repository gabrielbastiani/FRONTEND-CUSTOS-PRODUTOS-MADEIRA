"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { RawMaterial, UNIT_LABELS } from "@/types";
import { useDeleteRawMaterial } from "@/hooks/use-raw-materials";
import { formatCurrency } from "@/lib/format";
import { EntityThumbnail } from "@/components/shared/entity-thumbnail";
import { RawMaterialRestockDialog } from "@/components/raw-materials/raw-material-restock-dialog";
import { Pencil, Trash2, PackagePlus, Settings2, History } from "lucide-react";
import { RawMaterialAdjustStockDialog } from "@/components/raw-materials/raw-material-adjust-stock-dialog";
import { RawMaterialHistoryDialog } from "@/components/raw-materials/raw-material-history-dialog";

interface Props {
  materials: RawMaterial[];
  onEdit: (material: RawMaterial) => void;
}

export function RawMaterialsTable({ materials, onEdit }: Props) {
  const [adjustingMaterial, setAdjustingMaterial] =
    useState<RawMaterial | null>(null);
  const [viewingHistoryMaterial, setViewingHistoryMaterial] =
    useState<RawMaterial | null>(null);
  const [restockingMaterial, setRestockingMaterial] =
    useState<RawMaterial | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteMutation = useDeleteRawMaterial();

  const handleConfirmDelete = async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  if (materials.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-slate-500">
        Nenhuma matéria-prima cadastrada ainda.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Foto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Compra</TableHead>
              <TableHead>Uso</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Custo unitário</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => (
              <TableRow key={material.id}>
                <TableCell>
                  <EntityThumbnail
                    ownerType="raw-materials"
                    ownerId={material.id}
                  />
                </TableCell>
                <TableCell className="font-medium">{material.name}</TableCell>
                <TableCell>{material.supplier?.name || "—"}</TableCell>
                <TableCell>
                  {material.purchaseQty} {UNIT_LABELS[material.purchaseUnit]}{" "}
                  por {formatCurrency(material.purchasePrice)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {UNIT_LABELS[material.usageUnit]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={
                      material.minStockAlert != null &&
                      material.stockQty <= material.minStockAlert
                        ? "font-medium text-red-600"
                        : ""
                    }
                  >
                    {material.stockQty}{" "}
                    {UNIT_LABELS[material.usageUnit].toLowerCase()}
                  </span>
                  {material.minStockAlert != null &&
                    material.stockQty <= material.minStockAlert && (
                      <p className="text-xs text-red-500">Estoque baixo</p>
                    )}
                </TableCell>
                <TableCell>
                  {material.unitCost !== undefined
                    ? `${formatCurrency(material.unitCost)} / ${UNIT_LABELS[
                        material.usageUnit
                      ].toLowerCase()}`
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRestockingMaterial(material)}
                    title="Repor estoque"
                  >
                    <PackagePlus className="h-4 w-4 text-emerald-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAdjustingMaterial(material)}
                    title="Ajustar estoque"
                  >
                    <Settings2 className="h-4 w-4 text-amber-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewingHistoryMaterial(material)}
                    title="Ver histórico de estoque"
                  >
                    <History className="h-4 w-4 text-slate-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(material)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingId(material.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover matéria-prima?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Produtos que usam esse insumo
              podem ser afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RawMaterialRestockDialog
        open={!!restockingMaterial}
        onOpenChange={(open) => !open && setRestockingMaterial(null)}
        rawMaterial={restockingMaterial}
      />
      <RawMaterialAdjustStockDialog
        open={!!adjustingMaterial}
        onOpenChange={(open) => !open && setAdjustingMaterial(null)}
        rawMaterial={adjustingMaterial}
      />

      <RawMaterialHistoryDialog
        open={!!viewingHistoryMaterial}
        onOpenChange={(open) => !open && setViewingHistoryMaterial(null)}
        rawMaterial={viewingHistoryMaterial}
      />
    </>
  );
}
