"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLaborRates } from "@/hooks/use-labor-rates";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/format";

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
  const { data: laborRates, isLoading } = useLaborRates();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [hours, setHours] = useState("");

  const selectedRate = laborRates?.find((r) => r.id === selectedId);

  const handleAdd = () => {
    if (!selectedRate || !hours) return;

    onAdd({
      laborRateId: selectedRate.id,
      name: selectedRate.name,
      hourlyRate: selectedRate.hourlyRate,
      hoursSpent: Number(hours),
    });

    setSelectedId(undefined);
    setHours("");
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-end rounded-md border bg-slate-50 p-3">
      <div className="col-span-6 space-y-1">
        <Label className="text-xs">Tipo de mão de obra</Label>
        <Select
          key={selectedId ?? "empty"}
          value={selectedId}
          onValueChange={setSelectedId}
          disabled={isLoading || !laborRates?.length}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o tipo de mão de obra"}>
  {() => selectedRate?.name ?? ""}
</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {laborRates?.map((rate) => (
              <SelectItem key={rate.id} value={rate.id}>
                {rate.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedRate && (
          <p className="text-[11px] text-slate-500">
            {formatCurrency(selectedRate.hourlyRate)} por hora
          </p>
        )}
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
        <Button
          type="button"
          onClick={handleAdd}
          disabled={!selectedId || !hours}
          className="w-full"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
