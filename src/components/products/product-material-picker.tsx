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
import { useRawMaterials } from "@/hooks/use-raw-materials";
import { UNIT_LABELS } from "@/types";
import { Plus } from "lucide-react";

export interface DraftMaterialItem {
  rawMaterialId: string;
  name: string;
  usageUnitLabel: string;
  quantityUsed: number;
  wastePercent: number;
}

interface Props {
  onAdd: (item: DraftMaterialItem) => void;
}

export function ProductMaterialPicker({ onAdd }: Props) {
  const { data: materials, isLoading } = useRawMaterials();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState("");
  const [waste, setWaste] = useState("0");

  const selectedMaterial = materials?.find((m) => m.id === selectedId);

  const handleAdd = () => {
    if (!selectedMaterial || !quantity) return;

    onAdd({
      rawMaterialId: selectedMaterial.id,
      name: selectedMaterial.name,
      usageUnitLabel: UNIT_LABELS[selectedMaterial.usageUnit],
      quantityUsed: Number(quantity),
      wastePercent: Number(waste) || 0,
    });

    setSelectedId(undefined);
    setQuantity("");
    setWaste("0");
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-end rounded-md border bg-slate-50 p-3">
      <div className="col-span-5 space-y-1">
        <Label className="text-xs">Matéria-prima</Label>
        <Select
          key={selectedId ?? "empty"}
          value={selectedId}
          onValueChange={setSelectedId}
          disabled={isLoading || !materials?.length}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                isLoading ? "Carregando..." : "Selecione uma matéria-prima"
              }
            >
              {() => selectedMaterial?.name ?? ""}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {materials?.map((material) => (
              <SelectItem key={material.id} value={material.id}>
                {material.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-3 space-y-1">
        <Label className="text-xs">
          Quantidade usada
          {selectedMaterial && (
            <span className="font-normal text-slate-400">
              {" "}
              ({UNIT_LABELS[selectedMaterial.usageUnit].toLowerCase()})
            </span>
          )}
        </Label>
        <Input
          type="number"
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Ex: 80"
        />
        <p className="text-[11px] leading-tight text-slate-500">
          Quanto desse material 1 unidade do produto consome
        </p>
      </div>
      <div className="col-span-2 space-y-1">
        <Label className="text-xs">Desperdício (%)</Label>
        <Input
          type="number"
          step="any"
          value={waste}
          onChange={(e) => setWaste(e.target.value)}
        />
      </div>
      <div className="col-span-2">
        <Button
          type="button"
          onClick={handleAdd}
          disabled={!selectedId || !quantity}
          className="w-full"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
