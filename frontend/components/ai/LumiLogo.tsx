import React from 'react';
import Image from 'next/image';

interface LumiLogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Official Lumi AI Logo Component
 * Renders the official cyan and royal blue 4-point swirl/star logo
 * with exact aspect ratio, crisp anti-aliasing, and responsive sizing.
 */
export function LumiLogo({ size = 32, className = '', priority = false }: LumiLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 aspect-square select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-label="Lumi AI Logo"
    >
      <Image
        src="/lumi-logo.png"
        alt="Lumi AI Logo"
        width={size * 2}
        height={size * 2}
        priority={priority}
        className="w-full h-full object-contain pointer-events-none"
        style={{
          imageRendering: 'auto',
        }}
      />
    </div>
  );
}

export default LumiLogo;
