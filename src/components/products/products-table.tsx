'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Eye, Trash2 } from 'lucide-react';
import { Product } from '@/types';
import { useDeleteProduct } from '@/hooks/use-products';
import { ProductPriceCell } from './product-price-cell';
import { EntityThumbnail } from '@/components/shared/entity-thumbnail';

interface Props {
  products: Product[];
}

export function ProductsTable({ products }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteMutation = useDeleteProduct();

  const handleConfirmDelete = async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-slate-500">
        Nenhum produto cadastrado ainda.
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
              <TableHead>Itens de material</TableHead>
              <TableHead>Itens de mão de obra</TableHead>
              <TableHead>Margem</TableHead>
              <TableHead>Preço final</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <EntityThumbnail ownerType="products" ownerId={product.id} />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.materials?.length ?? 0}</TableCell>
                <TableCell>{product.labors?.length ?? 0}</TableCell>
                <TableCell>{product.marginPercent}%</TableCell>
                <TableCell>
                  <ProductPriceCell productId={product.id} />
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/products/${product.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingId(product.id)}
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
            <AlertDialogTitle>Remover produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita e removerá também o histórico de precificação
              associado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}