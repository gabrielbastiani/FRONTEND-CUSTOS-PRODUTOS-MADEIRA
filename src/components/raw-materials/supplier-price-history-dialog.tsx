"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { MaterialSupplier, UNIT_LABELS } from "@/types";
import { useMaterialPriceHistory } from "@/hooks/use-raw-materials";
import { formatCurrency } from "@/lib/format";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string;
  entry: MaterialSupplier | null;
}

export function SupplierPriceHistoryDialog({
  open,
  onOpenChange,
  materialId,
  entry,
}: Props) {
  const { data, isLoading } = useMaterialPriceHistory(
    materialId,
    entry?.id ?? "",
    open && !!entry
  );

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de preços — {entry.supplier.name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border p-3">
                <p className="text-xs text-slate-500">Preço atual</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(entry.purchasePrice)}
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-slate-500">
                  Média dos últimos registros
                </p>
                <p className="text-lg font-semibold">
                  {formatCurrency(Number(data.averagePrice))}
                </p>
              </div>
            </div>

            {data.priceAlert ? (
              <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{data.priceAlert}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Preço dentro do esperado.</span>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">
                Registros anteriores
              </p>
              {data.materialSupplier.priceHistory?.length ? (
                data.materialSupplier.priceHistory.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between rounded-md border p-2 text-sm"
                  >
                    <span>
                      {formatCurrency(h.purchasePrice)} por {h.purchaseQty}{" "}
                      {UNIT_LABELS[h.purchaseUnit]?.toLowerCase()}
                    </span>
                    <span className="text-slate-500">
                      {new Date(h.recordedAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Nenhum registro de histórico ainda.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Não foi possível carregar o histórico.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}