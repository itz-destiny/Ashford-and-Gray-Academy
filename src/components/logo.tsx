
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2 shrink-0', className)}>
      <div className="bg-primary p-1.5 rounded-lg shrink-0">
        <GraduationCap className="h-5 w-5 text-primary-foreground" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <h1 className="text-base md:text-lg font-bold leading-none whitespace-nowrap">
            Ashford & Gray
          </h1>
          <span className="text-[0.5rem] md:text-[0.6rem] font-bold uppercase tracking-wider opacity-90 whitespace-nowrap">
            Fusion Academy
          </span>
        </div>
      )}
    </div>
  );
}
