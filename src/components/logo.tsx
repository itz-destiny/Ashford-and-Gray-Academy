
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="bg-primary p-1.5 rounded-lg">
        <GraduationCap className="h-5 w-5 text-primary-foreground" />
      </div>
      {showText && (
        <h1 className={cn("text-xl font-bold", className)}>
          Ashford & Gray
        </h1>
      )}
    </div>
  );
}
