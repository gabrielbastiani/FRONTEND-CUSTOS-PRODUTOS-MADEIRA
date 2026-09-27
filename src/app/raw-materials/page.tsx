'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRawMaterials } from '@/hooks/use-raw-materials';
import { RawMaterialsTable } from '@/components/raw-materials/raw-materials-table';
import { RawMaterialFormDialog } from '@/components/raw-materials/raw-material-form-dialog';
import { LowStockAlert } from '@/components/raw-materials/low-stock-alert';
import { RawMaterial } from '@/types';

export default function RawMaterialsPage() {
  const { data: materials, isLoading } = useRawMaterials();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  const handleNew = () => {
    setEditingMaterial(null);
    setDialogOpen(true);
  };

  const handleEdit = (material: RawMaterial) => {
    setEditingMaterial(material);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Cadastre táboas, parafusos, cola, verniz e demais insumos com suas unidades de
          compra e uso.
        </p>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova matéria-prima
        </Button>
      </div>

      <LowStockAlert />

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <RawMaterialsTable materials={materials ?? []} onEdit={handleEdit} />
      )}

      <RawMaterialFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rawMaterial={editingMaterial}
      />
    </div>
  );
}