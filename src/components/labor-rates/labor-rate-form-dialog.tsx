'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldHint } from '@/components/ui/field-hint';
import { SectionIntro } from '@/components/ui/section-intro';
import { LaborRate } from '@/types';
import { useCreateLaborRate, useUpdateLaborRate } from '@/hooks/use-labor-rates';

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  hourlyRate: z.coerce.number().positive('Valor hora deve ser positivo'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  laborRate?: LaborRate | null;
}

export function LaborRateFormDialog({ open, onOpenChange, laborRate }: Props) {
  const isEditing = !!laborRate;
  const createMutation = useCreateLaborRate();
  const updateMutation = useUpdateLaborRate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', hourlyRate: 0 },
  });

  useEffect(() => {
    if (laborRate) {
      reset({ name: laborRate.name, hourlyRate: laborRate.hourlyRate });
    } else {
      reset({ name: '', hourlyRate: 0 });
    }
  }, [laborRate, reset, open]);

  const onSubmit = async (values: FormValues) => {
    if (isEditing && laborRate) {
      await updateMutation.mutateAsync({ id: laborRate.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar tipo de mão de obra' : 'Novo tipo de mão de obra'}
          </DialogTitle>
        </DialogHeader>

        <SectionIntro>
          Aqui você cadastra os diferentes tipos de trabalho envolvidos na fabricação
          dos seus produtos, cada um com seu próprio valor por hora, como
          &quot;Marceneiro Sênior&quot; ou &quot;Ajudante Geral&quot;. Isso permite que o sistema
          calcule automaticamente o custo de mão de obra de cada produto, com base em
          quantas horas cada tipo de profissional gasta para fabricá-lo.
        </SectionIntro>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome / função *</Label>
            <Input id="name" {...register('name')} placeholder="Ex: Marceneiro Sênior" />
            <FieldHint>
              Nome do cargo ou função, usado depois na hora de montar um produto para
              escolher qual tipo de mão de obra foi empregado.
            </FieldHint>
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Valor por hora (R$) *</Label>
            <Input
              id="hourlyRate"
              type="number"
              step="any"
              {...register('hourlyRate')}
              placeholder="Ex: 35.00"
            />
            <FieldHint>
              Quanto custa uma hora de trabalho dessa função. O sistema multiplica esse
              valor pelas horas gastas em cada produto para calcular o custo de mão de
              obra automaticamente.
            </FieldHint>
            {errors.hourlyRate && (
              <p className="text-sm text-red-600">{errors.hourlyRate.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}