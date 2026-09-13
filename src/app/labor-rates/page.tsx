'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLaborRates } from '@/hooks/use-labor-rates';
import { LaborRatesTable } from '@/components/labor-rates/labor-rates-table';
import { LaborRateFormDialog } from '@/components/labor-rates/labor-rate-form-dialog';
import { LaborRate } from '@/types';

export default function LaborRatesPage() {
  const { data: laborRates, isLoading } = useLaborRates();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<LaborRate | null>(null);

  const handleNew = () => {
    setEditingRate(null);
    setDialogOpen(true);
  };

  const handleEdit = (rate: LaborRate) => {
    setEditingRate(rate);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Cadastre os tipos de mão de obra e seus respectivos valores por hora.
        </p>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo tipo
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <LaborRatesTable laborRates={laborRates ?? []} onEdit={handleEdit} />
      )}

      <LaborRateFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        laborRate={editingRate}
      />
    </div>
  );
}