'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function StudentErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[STUDENT PORTAL ERROR]', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 text-center shadow-md">
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
          <AlertTriangle size={28} />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full inline-block mb-2">
          Student Portal Notice
        </span>

        <h2 className="font-heading text-xl font-bold text-slate-900 tracking-tight mb-2">
          Unable to Load Academic Records
        </h2>

        <p className="text-xs text-slate-600 leading-relaxed font-sans mb-6">
          The student portal encountered an issue while communicating with the academic server. You can try refreshing the page or signing in again.
        </p>

        {error?.message && process.env.NODE_ENV !== 'production' && (
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left overflow-x-auto text-[11px] font-mono text-slate-700 max-h-32">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            onClick={() => reset()}
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs py-2 px-4"
          >
            <RefreshCw size={13} />
            <span>Retry Loading</span>
          </button>
          <Link
            href="/login"
            className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs py-2 px-4"
          >
            <LogIn size={13} />
            <span>Sign In Again</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
