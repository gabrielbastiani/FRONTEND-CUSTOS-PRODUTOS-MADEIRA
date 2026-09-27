import { cn } from '@/lib/utils';

interface FieldHintProps {
  children: React.ReactNode;
  className?: string;
}

export function FieldHint({ children, className }: FieldHintProps) {
  return (
    <p className={cn('text-xs leading-relaxed text-slate-500', className)}>
      {children}
    </p>
  );
}