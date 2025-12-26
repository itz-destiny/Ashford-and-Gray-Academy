import { cn } from '@/lib/utils';
import { Diamond } from 'lucide-react';

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export function EduEventLogo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="bg-primary p-1.5 rounded-lg">
        <Diamond className="h-5 w-5 text-primary-foreground" />
      </div>
      {showText && (
        <h1 className="text-xl font-bold text-foreground">
          EduEvent
        </h1>
      )}
    </div>
  );
}
