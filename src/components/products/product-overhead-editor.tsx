'use client';

import { FieldHint } from '@/components/ui/field-hint';
import { OverheadCostPicker, OverheadItem } from './overhead-cost-picker';

interface Props {
  overheadItems: OverheadItem[];
  onOverheadItemsChange: (items: OverheadItem[]) => void;
}

export function ProductOverheadEditor({
  overheadItems,
  onOverheadItemsChange,
}: Props) {
  return (
    <div className="space-y-4">
      <FieldHint>
        Informe o valor em reais por unidade. Classifique como custo variável (cola,
        lixa, embalagem e consumíveis) ou como rateio fixo (parte do aluguel, internet,
        manutenção ou outras despesas mensais). O rateio fixo entra no custo e no preço,
        mas não é contado novamente como custo variável no ponto de equilíbrio, pois as
        despesas mensais já são consideradas naquele indicador.
      </FieldHint>
      <OverheadCostPicker
        items={overheadItems}
        onChange={onOverheadItemsChange}
      />
    </div>
  );
}
