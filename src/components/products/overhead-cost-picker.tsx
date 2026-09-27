'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

export interface OverheadItem {
  name: string;
  value: number;
}

interface Props {
  items: OverheadItem[];
  onChange: (items: OverheadItem[]) => void;
}

export function OverheadCostPicker({ items, onChange }: Props) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !value) return;
    onChange([...items, { name: name.trim(), value: Number(value) }]);
    setName('');
    setValue('');
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 gap-2 items-end rounded-md border bg-slate-50 p-3">
        <div className="col-span-7 space-y-1">
          <Label className="text-xs">Descrição do custo</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Energia elétrica"
          />
        </div>
        <div className="col-span-3 space-y-1">
          <Label className="text-xs">Valor (R$)</Label>
          <Input
            type="number"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ex: 0.10"
          />
        </div>
        <div className="col-span-2">
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!name.trim() || !value}
            className="w-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border p-3 text-sm"
            >
              <span>
                <span className="font-medium">{item.name}</span> —{' '}
                {formatCurrency(item.value)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ))}
          <p className="text-right text-sm font-medium text-slate-700">
            Total de custos indiretos: {formatCurrency(total)}
          </p>
        </div>
      )}

      {items.length === 0 && (
        <p className="text-sm text-slate-500">
          Nenhum custo indireto adicionado. Se não adicionar nenhum, o overhead será
          considerado zero.
        </p>
      )}
    </div>
  );
}