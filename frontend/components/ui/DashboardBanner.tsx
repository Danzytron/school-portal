import React from 'react';

interface DashboardBannerProps {
  className?: string;
}

export function DashboardBanner({ className = '' }: DashboardBannerProps) {
  return (
    <div 
      className={`relative w-full overflow-hidden rounded-2xl border border-[#BFDBFE]/60 bg-[#D9EBFC] shadow-xs select-none ${className}`}
    >
      {/* School building background image aligned to the right side */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-right bg-cover"
        style={{
          backgroundImage: `url('/dashboard-banner.png')`,
          backgroundPosition: 'right center',
        }}
        aria-hidden="true"
      />

      {/* Soft progressive gradient to ensure clean and spacious left text contrast */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-[#D9EBFC] via-[#D9EBFC]/80 to-transparent w-full sm:w-2/3 pointer-events-none"
        aria-hidden="true"
      />

      {/* Clean Portal Header Typography */}
      <div className="relative z-10 px-5 py-5 sm:px-8 sm:py-7 md:py-8 flex flex-col justify-center min-h-[100px] sm:min-h-[120px] md:min-h-[135px]">
        <h1 className="font-heading text-lg sm:text-2xl md:text-[26px] font-bold tracking-tight text-slate-900 m-0 leading-tight">
          CEBU EASTERN COLLEGE
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-600 sm:text-slate-700 mt-0.5 sm:mt-1 font-sans">
          School Portal System
        </p>
      </div>
    </div>
  );
}

export default DashboardBanner;
