'use client'

import { useState } from 'react';
import { ImageIcon, Images } from 'lucide-react';
import { useEntityImages } from '@/hooks/use-images';
import { ImageOwnerType } from '@/types';
import { getImageUrl } from '@/lib/get-image-url';
import { cn } from '@/lib/utils';
import { ImageLightbox } from './image-lightbox';

interface Props {
  ownerType: ImageOwnerType;
  ownerId: string;
  className?: string;
}

export function EntityThumbnail({ ownerType, ownerId, className }: Props) {
  const { data: images, isLoading } = useEntityImages(ownerType, ownerId);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const firstImage = images?.[0];
  const hasMultiple = (images?.length ?? 0) > 1;

  if (isLoading || !firstImage) {
    return (
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-slate-100',
          className
        )}
      >
        <ImageIcon className="h-4 w-4 text-slate-300" />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className={cn(
          'group relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-slate-100 transition-transform hover:scale-105',
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getImageUrl(firstImage.url)}
          alt={firstImage.filename}
          className="h-full w-full object-cover"
        />
        {hasMultiple && (
          <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-tl-md bg-black/60 text-white">
            <Images className="h-2.5 w-2.5" />
          </span>
        )}
      </button>

      {images && (
        <ImageLightbox
          images={images}
          initialIndex={0}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      )}
    </>
  );
}