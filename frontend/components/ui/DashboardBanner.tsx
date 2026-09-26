import React from 'react';

interface DashboardBannerProps {
  className?: string;
}

export function DashboardBanner({ className = '' }: DashboardBannerProps) {
  return (
    <div 
      className={`relative w-full overflow-hidden rounded-2xl border border-blue-200/60 bg-[#E2F0FD] shadow-xs select-none ${className}`}
    >
      {/* Real Cebu Eastern College building photo background softly faded and positioned on the right */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-right bg-cover transition-all"
        style={{
          backgroundImage: `url('/cec-banner-bg.png')`,
          backgroundPosition: 'right center',
        }}
        aria-hidden="true"
      />

      {/* Subtle progressive left-to-right soft gradient overlay for crisp text contrast */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-[#E2F0FD] via-[#E2F0FD]/85 to-transparent w-full sm:w-3/5 pointer-events-none"
        aria-hidden="true"
      />

      {/* Portal Header Title & Descriptor */}
      <div className="relative z-10 px-5 py-5 sm:px-8 sm:py-6 md:py-7 flex flex-col justify-center min-h-[95px] sm:min-h-[115px] md:min-h-[125px]">
        <h1 className="font-heading text-lg sm:text-2xl md:text-[26px] font-bold tracking-tight text-slate-900 m-0 leading-tight">
          CEBU EASTERN COLLEGE
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-600 sm:text-slate-700 mt-0.5 sm:mt-1 font-sans tracking-wide">
          School Portal System
        </p>
      </div>
    </div>
  );
}

export default DashboardBanner;
