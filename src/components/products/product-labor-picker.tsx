'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLaborRates } from '@/hooks/use-labor-rates';
import { Plus } from 'lucide-react';

export interface DraftLaborItem {
  laborRateId: string;
  name: string;
  hourlyRate: number;
  hoursSpent: number;
}

interface Props {
  onAdd: (item: DraftLaborItem) => void;
}

export function ProductLaborPicker({ onAdd }: Props) {
  const { data: laborRates } = useLaborRates();
  const [selectedId, setSelectedId] = useState('');
  const [hours, setHours] = useState('');

  const handleAdd = () => {
    const rate = laborRates?.find((r) => r.id === selectedId);
    if (!rate || !hours) return;

    onAdd({
      laborRateId: rate.id,
      name: rate.name,
      hourlyRate: rate.hourlyRate,
      hoursSpent: Number(hours),
    });

    setSelectedId('');
    setHours('');
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-end rounded-md border bg-slate-50 p-3">
      <div className="col-span-6 space-y-1">
        <Label className="text-xs">Tipo de mão de obra</Label>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {laborRates?.map((rate) => (
              <SelectItem key={rate.id} value={rate.id}>
                {rate.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-4 space-y-1">
        <Label className="text-xs">Horas gastas</Label>
        <Input
          type="number"
          step="any"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="Ex: 2.5"
        />
      </div>
      <div className="col-span-2">
        <Button type="button" onClick={handleAdd} disabled={!selectedId || !hours} className="w-full">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}