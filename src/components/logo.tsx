import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <GraduationCap className="h-7 w-7 text-accent" />
      {showText && (
        <h1 className="text-xl font-bold font-headline text-sidebar-foreground">
          Ashford & Gray
        </h1>
      )}
    </div>
  );
}
