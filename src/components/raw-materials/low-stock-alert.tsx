"use client";

import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLowStockMaterials } from "@/hooks/use-production";
import { UNIT_LABELS } from "@/types";
import { formatNumber } from "@/lib/format";

export function LowStockAlert() {
  const { data: materials, isLoading } = useLowStockMaterials();

  if (isLoading || !materials || materials.length === 0) return null;

  return (
    <Card className="border-amber-400 bg-amber-50">
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          <p className="text-sm font-medium">
            {materials.length} matéria(s)-prima(s) com estoque baixo
          </p>
        </div>
        <div className="grid gap-1 text-sm text-amber-700">
          {materials.map((material) => (
            <div key={material.id} className="flex justify-between">
              <span>{material.name}</span>
              <span>
                {formatNumber(material.stockQty)} {UNIT_LABELS[material.usageUnit].toLowerCase()}
                {material.minStockAlert != null && (
                  <> (mínimo: {formatNumber(material.minStockAlert)})</>
                )}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}