
import Image from 'next/image';
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
    if (!showText) {
      // Icon-only versions
      return variant === 'white' ? '/A&G just logo white.png' : '/A&G just logo.png';
    }

    // Full logo versions
    switch (variant) {
      case 'white':
        return '/A&G Logo white.png';
      case 'blue':
        return '/A&G blue.png';
      default:
        return '/A&G Logo.png';
    }
  };

  return (
    <div className={cn('flex items-center shrink-0', className)}>
      <Image
        src={getLogoSrc()}
        alt="Ashford & Gray Fusion Academy"
        width={showText ? 140 : 32}
        height={showText ? 35 : 32}
        className="object-contain"
        priority
      />
    </div>
  );
}
