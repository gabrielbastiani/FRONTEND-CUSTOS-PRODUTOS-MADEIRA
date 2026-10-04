'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FieldHint } from '@/components/ui/field-hint';
import { useGenerateProductLabels } from '@/hooks/use-product-labels';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productIds: string[];
}

export function ProductLabelDialog({ open, onOpenChange, productIds }: Props) {
  const [format, setFormat] = useState<'SMALL' | 'CARD'>('SMALL');
  const generateMutation = useGenerateProductLabels();

  const handleGenerate = async () => {
    await generateMutation.mutateAsync({ productIds, format });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar etiqueta para impressão</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <FieldHint>
            Escolha o formato de impressão: etiqueta pequena para colar no produto, ou
            ficha maior para expor em uma mesa ou vitrine durante uma feira.
          </FieldHint>

          <RadioGroup value={format} onValueChange={(v) => setFormat(v as 'SMALL' | 'CARD')}>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="SMALL" id="label-small" />
              <Label htmlFor="label-small" className="cursor-pointer font-normal">
                Etiqueta pequena (colar no produto)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="CARD" id="label-card" />
              <Label htmlFor="label-card" className="cursor-pointer font-normal">
                Ficha para exposição (feiras e bazares)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
            {generateMutation.isPending ? 'Gerando...' : 'Gerar PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}