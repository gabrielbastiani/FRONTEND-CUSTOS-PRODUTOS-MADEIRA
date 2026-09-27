'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Factory } from 'lucide-react';
import { useProduceProduct } from '@/hooks/use-production';

interface Props {
  productId: string;
}

export function ProductionForm({ productId }: Props) {
  const [quantity, setQuantity] = useState('1');
  const produceMutation = useProduceProduct(productId);

  const handleSubmit = () => {
    const value = parseFloat(quantity);
    if (!value || value <= 0) return;

    produceMutation.mutate(value, {
      onSuccess: () => setQuantity('1'),
    });
  };

  return (
    <div className="flex items-end gap-3 rounded-md border border-dashed p-4">
      <div className="flex-1 space-y-1">
        <Label htmlFor="quantityProduced">Quantidade produzida</Label>
        <Input
          id="quantityProduced"
          type="number"
          min="0"
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      <Button onClick={handleSubmit} disabled={produceMutation.isPending}>
        <Factory className="mr-2 h-4 w-4" />
        {produceMutation.isPending ? 'Registrando...' : 'Registrar produção'}
      </Button>
    </div>
  );
}