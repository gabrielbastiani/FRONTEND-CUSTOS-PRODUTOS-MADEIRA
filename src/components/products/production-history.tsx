'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';
import { ProductionRecord } from '@/types';

interface Props {
  records: ProductionRecord[];
}

export function ProductionHistory({ records }: Props) {
  if (records.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-slate-500">
        Nenhuma produção registrada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <Card key={record.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>{formatNumber(record.quantityProduced)} unidade(s) produzida(s)</span>
              <span className="text-sm font-normal text-slate-500">
                {formatDate(record.createdAt)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Custo unitário no momento</span>
              <span>{formatCurrency(record.unitCost)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Custo total da produção</span>
              <span>{formatCurrency(record.totalCost)}</span>
            </div>

            {record.stockMovements.length > 0 && (
              <div className="space-y-1 border-t pt-2">
                <p className="text-xs font-medium text-slate-500">
                  Matérias-primas consumidas
                </p>
                {record.stockMovements.map((movement) => (
                  <div key={movement.id} className="flex justify-between text-xs text-slate-600">
                    <span>{movement.rawMaterial.name}</span>
                    <span>{formatNumber(Math.abs(movement.quantity))}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}