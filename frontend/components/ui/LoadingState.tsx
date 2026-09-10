import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  text?: string;
  className?: string;
}

export function LoadingState({ message, text, className = "" }: LoadingStateProps) {
  const label = message || text || "Loading...";

  return (
    <div className={`p-8 text-center bg-white border border-gray-200 rounded flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 size={20} className="text-[#1D4ED8] animate-spin" />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

export default LoadingState;
