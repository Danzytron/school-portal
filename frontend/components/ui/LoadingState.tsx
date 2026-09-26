import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  text?: string;
  className?: string;
}

export function LoadingState({ message, text, className = "" }: LoadingStateProps) {
  const label = message || text || "Loading records...";

  return (
    <div className={`py-8 px-4 text-center bg-white border border-slate-200/90 rounded-lg shadow-2xs flex items-center justify-center gap-2.5 font-sans ${className}`}>
      <Loader2 size={16} className="text-[#1D4ED8] animate-spin shrink-0" />
      <span className="text-xs font-medium text-slate-500">{label}</span>
    </div>
  );
}

export default LoadingState;
