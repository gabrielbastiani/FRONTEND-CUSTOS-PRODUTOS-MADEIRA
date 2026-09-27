import { InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionIntroProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionIntro({ children, className }: SectionIntroProps) {
  return (
    <div
      className={cn(
        'flex gap-2 rounded-md border border-blue-100 bg-blue-50 p-3 text-xs leading-relaxed text-blue-800',
        className
      )}
    >
      <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}