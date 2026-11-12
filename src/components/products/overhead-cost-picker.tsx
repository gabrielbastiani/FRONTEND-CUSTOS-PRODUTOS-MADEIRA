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
  /** true = valor por unidade destinado a absorver custos fixos mensais já cadastrados. */
  isFixedCostAllocation?: boolean;
}

interface Props {
  items: OverheadItem[];
  onChange: (items: OverheadItem[]) => void;
}

export function OverheadCostPicker({ items, onChange }: Props) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [costType, setCostType] = useState<'variable' | 'fixed'>('variable');

  const handleAdd = () => {
    if (!name.trim() || value === '') return;
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue < 0) return;

    onChange([
      ...items,
      {
        name: name.trim(),
        value: numericValue,
        isFixedCostAllocation: costType === 'fixed',
      },
    ]);
    setName('');
    setValue('');
    setCostType('variable');
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleTypeChange = (index: number, nextType: 'variable' | 'fixed') => {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, isFixedCostAllocation: nextType === 'fixed' }
          : item
      )
    );
  };

  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 items-end gap-2 rounded-md border bg-slate-50 p-3">
        <div className="col-span-5 space-y-1">
          <Label className="text-xs">Descrição do custo indireto</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Cola, lixa ou embalagem"
          />
        </div>
        <div className="col-span-3 space-y-1">
          <Label className="text-xs">Valor por unidade (R$)</Label>
          <Input
            type="number"
            min="0"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ex: 0.50"
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Classificação</Label>
          <select
            value={costType}
            onChange={(e) => setCostType(e.target.value as 'variable' | 'fixed')}
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value="variable">Variável</option>
            <option value="fixed">Rateio fixo</option>
          </select>
        </div>
        <div className="col-span-2">
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!name.trim() || value === '' || !Number.isFinite(Number(value)) || Number(value) < 0}
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
              key={`${item.name}-${index}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <span className="font-medium">{item.name}</span>
                <span className="ml-2 text-slate-600">{formatCurrency(item.value)}</span>
                {item.isFixedCostAllocation && (
                  <span className="ml-2 text-xs text-amber-700">rateio de custo fixo</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  aria-label={`Classificação de ${item.name}`}
                  value={item.isFixedCostAllocation ? 'fixed' : 'variable'}
                  onChange={(e) => handleTypeChange(index, e.target.value as 'variable' | 'fixed')}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="variable">Custo variável</option>
                  <option value="fixed">Rateio fixo</option>
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  aria-label={`Remover ${item.name}`}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
          <p className="text-right text-sm font-medium text-slate-700">
            Total de custos indiretos por unidade: {formatCurrency(total)}
          </p>
        </div>
      )}

      {items.length === 0 && (
        <p className="text-sm text-slate-500">
          Nenhum custo indireto adicionado. Sem itens, o custo indireto deste produto será R$ 0,00.
        </p>
      )}
    </div>
  );
}
