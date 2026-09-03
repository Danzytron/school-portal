import React from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, children, action, className = "" }: ChartCardProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden flex flex-col ${className}`}>
      <div className="bg-slate-50/80 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider m-0">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-500 m-0 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-4 flex-1">
        {children}
      </div>
    </div>
  );
}

export default ChartCard;
