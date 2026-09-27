'use client'

import { useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ImagePlus, Trash2 } from 'lucide-react';
import { useEntityImages, useUploadImages, useDeleteImage } from '@/hooks/use-images';
import { ImageOwnerType } from '@/types';
import { getImageUrl } from '@/lib/get-image-url';
import { ImageLightbox } from './image-lightbox';

interface Props {
  ownerType: ImageOwnerType;
  ownerId: string | undefined;
}

export function ImageUploader({ ownerType, ownerId }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: images, isLoading } = useEntityImages(ownerType, ownerId);
  const uploadMutation = useUploadImages(ownerType, ownerId);
  const deleteMutation = useDeleteImage(ownerType, ownerId);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    uploadMutation.mutate(Array.from(files));
    e.target.value = '';
  };

  if (!ownerId) {
    return (
      <p className="text-xs text-slate-500">
        Salve o cadastro primeiro para poder anexar imagens.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-20 rounded-md" />
          ))}

        {!isLoading &&
          images?.map((image, index) => (
            <div
              key={image.id}
              className="group relative h-20 w-20 overflow-hidden rounded-md border bg-slate-100"
            >
              <button
                type="button"
                onClick={() => setLightboxIndex(index)}
                className="h-full w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getImageUrl(image.url)}
                  alt={image.filename}
                  className="h-full w-full object-cover"
                />
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(image.id)}
                disabled={deleteMutation.isPending}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-5 w-5 text-white" />
              </button>
            </div>
          ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-slate-300 text-slate-400 transition-colors hover:border-slate-400 hover:text-slate-600 disabled:opacity-50"
        >
          <ImagePlus className="h-5 w-5" />
          <span className="text-[10px]">
            {uploadMutation.isPending ? 'Enviando...' : 'Adicionar'}
          </span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {images && lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          open={lightboxIndex !== null}
          onOpenChange={(open) => !open && setLightboxIndex(null)}
        />
      )}
    </div>
  );
}