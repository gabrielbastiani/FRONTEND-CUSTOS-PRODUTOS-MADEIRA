import { ProductForm } from '@/components/products/product-form';

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm text-slate-500">
        Monte a composição do produto adicionando matérias-primas e mão de obra. O custo final
        será calculado automaticamente após a criação.
      </p>
      <ProductForm />
    </div>
  );
}