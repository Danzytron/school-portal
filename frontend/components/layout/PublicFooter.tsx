"use client";

import { MapPin } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="relative z-10 w-full bg-[#1E3A8A] text-white border-t-2 border-[#1D4ED8] font-sans py-4 sm:py-5 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 text-center sm:text-left">
        {/* 1. Official Cebu Eastern College Logo */}
        <img
          src="/cec-logo.png"
          alt="Cebu Eastern College Logo"
          className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 drop-shadow-xs"
        />

        {/* 2. School Name & 3. School Address */}
        <div className="flex flex-col items-center sm:items-start">
          <div className="font-heading font-bold text-base sm:text-lg text-white leading-tight tracking-tight">
            Cebu Eastern College
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-[13px] text-blue-100/90 mt-1 leading-normal">
            <MapPin className="w-3.5 h-3.5 text-blue-300 shrink-0" />
            <span>Leon Kilat Street, Cebu City, 6000, Cebu</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
