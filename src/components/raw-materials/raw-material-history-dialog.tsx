"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { RawMaterial, UNIT_LABELS } from "@/types";
import { useRawMaterialStockMovements } from "@/hooks/use-raw-materials";
import { formatNumber, formatDate } from "@/lib/format";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rawMaterial: RawMaterial | null;
}

const TYPE_LABELS: Record<string, string> = {
  CONSUMPTION: "Consumo em produção",
  RESTOCK: "Reposição",
  MANUAL_ADJUSTMENT: "Ajuste manual",
};

const TYPE_COLORS: Record<string, string> = {
  CONSUMPTION: "text-red-600",
  RESTOCK: "text-emerald-600",
  MANUAL_ADJUSTMENT: "text-amber-600",
};

export function RawMaterialHistoryDialog({ open, onOpenChange, rawMaterial }: Props) {
  const { data: movements, isLoading } = useRawMaterialStockMovements(rawMaterial?.id ?? "");

  if (!rawMaterial) return null;

  const usageLabel = UNIT_LABELS[rawMaterial.usageUnit]?.toLowerCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de estoque — {rawMaterial.name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !movements || movements.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-slate-500">
            Nenhuma movimentação registrada ainda para este material.
          </div>
        ) : (
          <div className="space-y-2">
            {movements.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <div>
                  <p className={`font-medium ${TYPE_COLORS[movement.type] ?? ""}`}>
                    {TYPE_LABELS[movement.type] ?? movement.type}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(movement.createdAt)}</p>
                  {movement.note && (
                    <p className="text-xs text-slate-500">{movement.note}</p>
                  )}
                </div>
                <span className={`font-medium ${movement.quantity < 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {movement.quantity > 0 ? "+" : ""}
                  {formatNumber(movement.quantity)} {usageLabel}
                </span>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}