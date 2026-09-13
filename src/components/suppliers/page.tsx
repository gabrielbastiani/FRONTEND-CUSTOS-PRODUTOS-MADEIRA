'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSuppliers } from '@/hooks/use-suppliers';
import { SuppliersTable } from '@/components/suppliers/suppliers-table';
import { SupplierFormDialog } from '@/components/suppliers/supplier-form-dialog';
import { Supplier } from '@/types';

export default function SuppliersPage() {
  const { data: suppliers, isLoading } = useSuppliers();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const handleNew = () => {
    setEditingSupplier(null);
    setDialogOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Gerencie os fornecedores de matéria-prima utilizados na produção.
        </p>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo fornecedor
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <SuppliersTable suppliers={suppliers ?? []} onEdit={handleEdit} />
      )}

      <SupplierFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        supplier={editingSupplier}
      />
    </div>
  );
}