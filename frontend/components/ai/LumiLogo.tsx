import React from 'react';
import Image from 'next/image';

interface LumiLogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Official Lumi AI Logo Component
 * Renders the official transparent cyan and royal blue 4-point swirl/star logo.
 * Tightly fitted to remove unnecessary padding and fill the avatar container perfectly.
 */
export function LumiLogo({ size, className = '', priority = false }: LumiLogoProps) {
  const inlineStyle = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 aspect-square select-none ${className}`}
      style={inlineStyle}
      aria-label="Lumi AI Logo"
    >
      <Image
        src="/lumi-logo.png"
        alt="Lumi AI Logo"
        width={size ? size * 2 : 128}
        height={size ? size * 2 : 128}
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
