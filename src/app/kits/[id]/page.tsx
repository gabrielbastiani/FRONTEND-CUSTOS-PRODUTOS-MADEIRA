"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { SectionIntro } from "@/components/ui/section-intro";
import { useKit, useKitCost } from "@/hooks/use-kits";
import { formatCurrency } from "@/lib/format";
import { ImageUploader } from '@/components/shared/image-uploader';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export default function KitDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: kit, isLoading: loadingKit } = useKit(params.id);
  const { data: pricing, isLoading: loadingPricing } = useKitCost(params.id);

  if (loadingKit) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!kit) {
    return <p className="text-sm text-slate-500">Kit não encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <SectionIntro>
        Veja abaixo o custo combinado deste kit e o preço final sugerido,
        considerando a margem de lucro definida especificamente para a venda em
        conjunto.
      </SectionIntro>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{kit.name}</CardTitle>
          <Link href={`/kits/${kit.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {kit.description && (
            <p className="text-sm text-slate-600">{kit.description}</p>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Imagens do kit</p>
            <ImageUploader ownerType="kits" ownerId={kit.id} />
          </div>

          <div className="space-y-2">
            {kit.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between rounded-md bg-slate-50 p-2 text-sm"
              >
                <span>
                  {item.product.name} × {item.quantity}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-900 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-base">Precificação do kit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingPricing || !pricing ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <>
              <div className="rounded-md bg-emerald-50 p-4 text-center">
                <p className="text-sm text-emerald-700">
                  Preço final sugerido do kit
                </p>
                <p className="text-3xl font-bold text-emerald-800">
                  {formatCurrency(pricing.finalPrice)}
                </p>
              </div>

              <Separator />

              <div className="space-y-1 text-sm">
                {pricing.items.map((item) => (
                  <div key={item.productId} className="flex justify-between">
                    <span className="text-slate-600">
                      {item.productName} × {item.quantity} (custo unitário{" "}
                      {formatCurrency(item.unitCost)})
                    </span>
                    <span>{formatCurrency(item.totalCost)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal dos produtos</span>
                  <span>{formatCurrency(pricing.itemsSubtotal)}</span>
                </div>
                {pricing.overheadCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">
                      Custos indiretos do kit ({pricing.overheadPercent}%)
                    </span>
                    <span>{formatCurrency(pricing.overheadCost)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700">Custo total do kit</span>
                  <span>{formatCurrency(pricing.subtotalCost)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Margem do kit ({pricing.marginPercent}%)</span>
                  <span>{formatCurrency(pricing.marginValue)}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
