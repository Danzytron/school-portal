import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  text?: string;
  className?: string;
}

export function LoadingState({ message, text, className = "" }: LoadingStateProps) {
  const label = message || text || "Loading data, please wait...";

  return (
    <div className={`p-8 text-center bg-white border border-slate-200 rounded-md shadow-2xs flex flex-col items-center justify-center gap-2.5 ${className}`}>
      <Loader2 size={24} className="text-blue-700 animate-spin" />
      <span className="text-xs font-medium text-slate-600">{label}</span>
    </div>
  );
}

export default LoadingState;
