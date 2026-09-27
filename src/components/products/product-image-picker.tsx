'use client'

import { useRef, useEffect } from 'react';
import { Trash2, ImagePlus } from 'lucide-react';

export interface DraftImageItem {
  file: File;
  previewUrl: string;
}

interface Props {
  items: DraftImageItem[];
  onChange: (items: DraftImageItem[]) => void;
}

export function ProductImagePicker({ items, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: DraftImageItem[] = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    onChange([...items, ...newItems]);
    e.target.value = '';
  };

  const handleRemove = (index: number) => {
    const target = items[index];
    URL.revokeObjectURL(target.previewUrl);
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {items.map((item, index) => (
          <div
            key={item.previewUrl}
            className="group relative h-20 w-20 overflow-hidden rounded-md border bg-slate-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.previewUrl}
              alt={item.file.name}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="h-5 w-5 text-white" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-slate-300 text-slate-400 transition-colors hover:border-slate-400 hover:text-slate-600"
        >
          <ImagePlus className="h-5 w-5" />
          <span className="text-[10px]">Adicionar</span>
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
    </div>
  );
}