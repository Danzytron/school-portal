'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GLOBAL PORTAL ERROR]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans text-slate-800">
      <header className="bg-[#172554] text-white border-b border-[#1E3A8A] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src="/cec-logo.jpg"
            alt="Cebu Eastern College Seal"
            className="w-9 h-9 object-contain rounded-full bg-white p-0.5 ring-1 ring-blue-300/40"
          />
          <div>
            <div className="font-heading font-bold text-sm sm:text-base tracking-tight text-white leading-none">
              CEBU EASTERN COLLEGE
            </div>
            <div className="text-[10px] text-blue-200 uppercase tracking-wider leading-tight mt-0.5 font-sans">
              University Information System
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-xl p-8 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-200">
            <AlertCircle size={28} />
          </div>

          <span className="font-mono text-2xl font-bold text-slate-900 block font-heading">
            System Notice
          </span>
          <h2 className="font-heading text-lg font-bold text-slate-900 mt-2 mb-1">
            Application Error Encountered
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed font-sans mb-6">
            An unexpected error occurred while processing your request. Please try reloading the page or return to the main sign-in portal.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => reset()}
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Reload Page</span>
            </button>
            <Link
              href="/login"
              className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-1.5"
            >
              <LogIn size={13} />
              <span>Sign In Page</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 px-4 py-3 text-center text-xs text-slate-400 font-mono">
        © 2026 Cebu Eastern College • University Information System
      </footer>
    </div>
  );
}
