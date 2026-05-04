import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'white' | 'icon-only' | 'blue';
};

/**
 * Ashford & Gray Logo Component
 * 
 * Logo Usage Guide:
 * - Full Logo (default): Use in light backgrounds (sidebars, headers)
 * - White Logo: Use on dark/colored backgrounds
 * - Icon Only: Use in compact spaces (mobile nav, favicon, small buttons)
 * - Blue: Use for primary brand emphasis
 */
export function Logo({ className, showText = true, variant = 'default' }: LogoProps) {
  // Logo selection based on variant
  const getLogoSrc = () => {
    if (!showText || variant === 'icon-only') {
      return '/icon.png';
    }

    // Full logo versions
    switch (variant) {
      case 'white':
        return '/A & G2.png';
      case 'blue':
        return '/A&G blue.png';
      default:
        return '/A & G1.png';
    }
  };

  return (
    <div className={cn('flex items-center shrink-0', className)}>
      <Link href="/">
        <Image
          src={getLogoSrc()}
          alt="Ashford & Gray Fusion Academy"
          width={showText ? 180 : 40}
          height={showText ? 45 : 40}
          className="object-contain"
          priority
        />
      </Link>
    </div>
  );
}
