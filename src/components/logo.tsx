import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  variant?: 'default' | 'white' | 'icon-only' | 'blue';
};

/**
 * Ashford & Gray Official Logo Component
 */
export function Logo({ className, variant = 'default' }: LogoProps) {
  let logoSrc = '/A & G1.png';
  if (variant === 'white') {
    logoSrc = '/A & G2.png';
  } else if (variant === 'blue') {
    logoSrc = '/A & G3.png';
  }

  return (
    <div className={cn('flex items-center shrink-0', className)}>
      <Link href="/" className="flex items-center group relative block">
        {/* Render official brand logo image */}
        <div className="relative h-12 w-48 md:h-14 md:w-56 transition-transform duration-300 hover:scale-102">
          <Image
            src={logoSrc}
            alt="Ashford & Gray Fusion Academy"
            fill
            sizes="(max-width: 768px) 192px, 224px"
            className="object-contain object-left"
            priority
          />
        </div>
      </Link>
    </div>
  );
}
