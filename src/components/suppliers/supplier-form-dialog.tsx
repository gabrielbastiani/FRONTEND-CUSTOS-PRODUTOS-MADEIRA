'use client'

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
import { ImageUploader } from '@/components/shared/image-uploader';
import { Supplier } from '@/types';
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/use-suppliers';

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  contact: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
}

export function SupplierFormDialog({ open, onOpenChange, supplier }: Props) {
  const isEditing = !!supplier;
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', contact: '', email: '', phone: '' },
  });

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        contact: supplier.contact ?? '',
        email: supplier.email ?? '',
        phone: supplier.phone ?? '',
      });
    } else {
      reset({ name: '', contact: '', email: '', phone: '' });
    }
  }, [supplier, reset, open]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      email: values.email || undefined,
    };

    if (isEditing && supplier) {
      await updateMutation.mutateAsync({ id: supplier.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar fornecedor' : 'Novo fornecedor'}</DialogTitle>
        </DialogHeader>

        <SectionIntro>
          Fornecedores são as empresas ou pessoas de quem você compra suas
          matérias-primas. Cadastrá-los permite vincular cada material comprado à sua
          origem, facilitando comparar preços entre fornecedores diferentes e saber
          rapidamente onde recomprar quando o estoque acabar.
        </SectionIntro>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...register('name')} placeholder="Ex: Madeireira Central" />
            <FieldHint>
              Nome da empresa ou pessoa fornecedora, como aparece na nota fiscal ou como
              você reconhece facilmente.
            </FieldHint>
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Contato</Label>
            <Input id="contact" {...register('contact')} placeholder="Nome do responsável" />
            <FieldHint>
              Nome de uma pessoa de contato dentro do fornecedor, opcional, útil quando
              você negocia sempre com a mesma pessoa.
            </FieldHint>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="contato@fornecedor.com"
            />
            <FieldHint>
              Opcional. Serve apenas como registro de contato, o sistema não envia
              e-mails automáticos para o fornecedor.
            </FieldHint>
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" {...register('phone')} placeholder="(11) 99999-9999" />
            <FieldHint>
              Opcional. Facilita entrar em contato rapidamente na hora de fazer um novo
              pedido de compra.
            </FieldHint>
          </div>

          <div className="space-y-2">
            <Label>Imagens</Label>
            <FieldHint>
              Adicione fotos de referência, opcional. Útil para identificar visualmente
              o fornecedor, como fachada, logotipo ou documentos relevantes.
            </FieldHint>
            <ImageUploader ownerType="suppliers" ownerId={supplier?.id} />
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