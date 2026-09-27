'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FieldHint } from '@/components/ui/field-hint';
import { SectionIntro } from '@/components/ui/section-intro';
import { Separator } from '@/components/ui/separator';
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
import { Trash2, Plus } from 'lucide-react';
import {
  useMarketplaces,
  useCreateMarketplace,
  useUpdateMarketplace,
  useDeleteMarketplace,
} from '@/hooks/use-marketplace';
import { LowValueFeeTier, Marketplace } from '@/types';

function FeeConfigForm({
  initialName,
  initialCommissionPercent,
  initialCommissionCapValue,
  initialFixedFeeValue,
  initialTiers,
  onSubmit,
  submitLabel,
  isSubmitting,
}: {
  initialName: string;
  initialCommissionPercent: string;
  initialCommissionCapValue: string;
  initialFixedFeeValue: string;
  initialTiers: LowValueFeeTier[];
  onSubmit: (payload: {
    name: string;
    commissionPercent: number;
    commissionCapValue: number | null;
    fixedFeeValue: number | null;
    lowValueFeeTiers: LowValueFeeTier[] | null;
  }) => void;
  submitLabel: string;
  isSubmitting: boolean;
}) {
  const [name, setName] = useState(initialName);
  const [commissionPercent, setCommissionPercent] = useState(initialCommissionPercent);
  const [commissionCapValue, setCommissionCapValue] = useState(initialCommissionCapValue);
  const [fixedFeeValue, setFixedFeeValue] = useState(initialFixedFeeValue);
  const [tiers, setTiers] = useState<LowValueFeeTier[]>(initialTiers);

  const handleAddTier = () => setTiers((prev) => [...prev, { maxValue: 0, fee: 0 }]);

  const handleRemoveTier = (index: number) =>
    setTiers((prev) => prev.filter((_, i) => i !== index));

  const handleTierChange = (index: number, field: keyof LowValueFeeTier, value: string) => {
    setTiers((prev) =>
      prev.map((tier, i) => (i === index ? { ...tier, [field]: parseFloat(value) || 0 } : tier))
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      commissionPercent: parseFloat(commissionPercent) || 0,
      commissionCapValue: commissionCapValue ? parseFloat(commissionCapValue) : null,
      fixedFeeValue: fixedFeeValue ? parseFloat(fixedFeeValue) : null,
      lowValueFeeTiers: tiers.length > 0 ? tiers : null,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nome do marketplace</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Amazon, Magalu, Shein..."
        />
        <FieldHint>
          Digite o nome da plataforma exatamente como você quer vê-lo listado no sistema.
        </FieldHint>
      </div>

      <div className="space-y-2">
        <Label>Comissão sobre o preço de venda (%)</Label>
        <Input
          type="number"
          step="any"
          value={commissionPercent}
          onChange={(e) => setCommissionPercent(e.target.value)}
        />
        <FieldHint>
          Percentual que a plataforma desconta sobre o preço final de venda. Varia por
          categoria de produto — consulte a categoria exata do seu produto no painel do
          marketplace para preencher com precisão.
        </FieldHint>
      </div>

      <div className="space-y-2">
        <Label>Teto máximo de comissão em R$ (opcional)</Label>
        <Input
          type="number"
          step="any"
          value={commissionCapValue}
          onChange={(e) => setCommissionCapValue(e.target.value)}
          placeholder="Deixe em branco se não houver teto"
        />
        <FieldHint>
          Alguns marketplaces limitam o valor máximo de comissão por unidade vendida,
          independentemente do preço. Deixe em branco se a plataforma não tiver esse
          limite.
        </FieldHint>
      </div>

      <div className="space-y-2">
        <Label>Taxa fixa por venda em R$ (opcional)</Label>
        <Input
          type="number"
          step="any"
          value={fixedFeeValue}
          onChange={(e) => setFixedFeeValue(e.target.value)}
          placeholder="Ex: 4.00"
        />
        <FieldHint>
          Valor fixo cobrado por unidade vendida, além da comissão percentual,
          independentemente do preço do produto.
        </FieldHint>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Faixas de taxa fixa para produtos de baixo valor (opcional)</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddTier}>
            <Plus className="mr-1 h-3 w-3" />
            Adicionar faixa
          </Button>
        </div>
        <FieldHint>
          Algumas plataformas cobram uma taxa fixa diferente quando o preço de venda é
          muito baixo. Cadastre cada faixa informando o valor máximo de venda coberto
          por ela e a taxa fixa correspondente.
        </FieldHint>

        {tiers.map((tier, index) => (
          <div key={index} className="flex items-end gap-2 rounded-md border p-3">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Preço de venda até (R$)</Label>
              <Input
                type="number"
                step="any"
                value={tier.maxValue}
                onChange={(e) => handleTierChange(index, 'maxValue', e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Taxa fixa cobrada (R$)</Label>
              <Input
                type="number"
                step="any"
                value={tier.fee}
                onChange={(e) => handleTierChange(index, 'fee', e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveTier(index)}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()} className="w-full">
        {isSubmitting ? 'Salvando...' : submitLabel}
      </Button>
    </div>
  );
}

function MarketplaceCard({ marketplace }: { marketplace: Marketplace }) {
  const updateMutation = useUpdateMarketplace();
  const deleteMutation = useDeleteMarketplace();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{marketplace.name}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setConfirmingDelete(true)}
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </CardHeader>
      <CardContent>
        <FeeConfigForm
          initialName={marketplace.name}
          initialCommissionPercent={String(marketplace.commissionPercent)}
          initialCommissionCapValue={
            marketplace.commissionCapValue !== null
              ? String(marketplace.commissionCapValue)
              : ''
          }
          initialFixedFeeValue={
            marketplace.fixedFeeValue !== null ? String(marketplace.fixedFeeValue) : ''
          }
          initialTiers={marketplace.lowValueFeeTiers ?? []}
          submitLabel="Salvar alterações"
          isSubmitting={updateMutation.isPending}
          onSubmit={(payload) =>
            updateMutation.mutate({ id: marketplace.id, payload })
          }
        />
      </CardContent>

      <AlertDialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover {marketplace.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Você deixará de poder calcular preços de
              venda para este marketplace até cadastrá-lo novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteMutation.mutateAsync(marketplace.id);
                setConfirmingDelete(false);
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function NewMarketplaceCard() {
  const createMutation = useCreateMarketplace();
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowForm(true)}
        className="w-full border-dashed"
      >
        <Plus className="mr-2 h-4 w-4" />
        Adicionar novo marketplace
      </Button>
    );
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">Novo marketplace</CardTitle>
      </CardHeader>
      <CardContent>
        <FeeConfigForm
          initialName=""
          initialCommissionPercent="0"
          initialCommissionCapValue=""
          initialFixedFeeValue=""
          initialTiers={[]}
          submitLabel="Adicionar marketplace"
          isSubmitting={createMutation.isPending}
          onSubmit={(payload) =>
            createMutation.mutate(payload, {
              onSuccess: () => setShowForm(false),
            })
          }
        />
      </CardContent>
    </Card>
  );
}

export default function MarketplaceSettingsPage() {
  const { data: marketplaces, isLoading } = useMarketplaces();

  return (
    <div className="space-y-6">
      <SectionIntro>
        Configure aqui as taxas cobradas por cada marketplace, incluindo os que você
        mesmo cadastrar (Amazon, Magalu, Shein, ou qualquer outro canal de venda). Esses
        valores são usados pela calculadora de preço de venda para simular quanto você
        precisa cobrar em cada plataforma. Atualize sempre que a plataforma anunciar
        mudanças em suas taxas.
      </SectionIntro>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!isLoading &&
        marketplaces?.map((marketplace) => (
          <MarketplaceCard key={marketplace.id} marketplace={marketplace} />
        ))}

      <NewMarketplaceCard />
    </div>
  );
}