'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PricingResult } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/format';

interface Props {
  pricing: PricingResult;
}

export function CostBreakdown({ pricing }: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Materiais</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Custo unitário</TableHead>
                <TableHead>Qtd. usada</TableHead>
                <TableHead>Desperdício</TableHead>
                <TableHead>Qtd. efetiva</TableHead>
                <TableHead className="text-right">Custo total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricing.breakdown.materials.map((item) => (
                <TableRow key={item.rawMaterialId}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{formatCurrency(item.unitCost)}</TableCell>
                  <TableCell>{formatNumber(item.quantityUsed)}</TableCell>
                  <TableCell>{item.wastePercent}%</TableCell>
                  <TableCell>{formatNumber(item.effectiveQuantity)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.totalCost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mão de obra</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Função</TableHead>
                <TableHead>Valor/hora</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead className="text-right">Custo total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricing.breakdown.labors.map((item) => (
                <TableRow key={item.laborRateId}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{formatCurrency(item.hourlyRate)}</TableCell>
                  <TableCell>{formatNumber(item.hoursSpent)}h</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.totalCost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-slate-900">
        <CardHeader>
          <CardTitle className="text-base">Resumo final</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Custo de materiais</span>
            <span>{formatCurrency(pricing.materialsCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Custo de mão de obra</span>
            <span>{formatCurrency(pricing.laborCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">
              Custos indiretos ({pricing.breakdown.overheadPercent}%)
            </span>
            <span>{formatCurrency(pricing.overheadCost)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Subtotal</span>
            <span>{formatCurrency(pricing.subtotalCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">
              Margem de lucro ({pricing.breakdown.marginPercent}%)
            </span>
            <span>{formatCurrency(pricing.marginValue)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold text-emerald-700">
            <span>Preço final sugerido</span>
            <span>{formatCurrency(pricing.finalPrice)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}