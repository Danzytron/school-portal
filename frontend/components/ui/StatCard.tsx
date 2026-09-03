import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: any;
  color?: string;
  className?: string;
  link?: string;
  linkText?: string;
  subtitle?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: IconProp, 
  color = "primary",
  className = "",
  link,
  linkText = "View Details",
  subtitle
}: StatCardProps) {
  
  const colorMap: Record<string, { iconBg: string, borderTop: string, text: string }> = {
    primary: {
      iconBg: "bg-blue-50 text-[#1D4ED8] border-blue-200",
      borderTop: "border-t-[#1D4ED8]",
      text: "text-[#1D4ED8]"
    },
    success: {
      iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      borderTop: "border-t-emerald-600",
      text: "text-emerald-700"
    },
    warning: {
      iconBg: "bg-amber-50 text-amber-800 border-amber-200",
      borderTop: "border-t-amber-500",
      text: "text-amber-700"
    },
    danger: {
      iconBg: "bg-rose-50 text-rose-700 border-rose-200",
      borderTop: "border-t-rose-600",
      text: "text-rose-700"
    },
    info: {
      iconBg: "bg-sky-50 text-sky-700 border-sky-200",
      borderTop: "border-t-sky-500",
      text: "text-sky-700"
    }
  };

  const theme = colorMap[color] || colorMap.primary;

  const renderIcon = () => {
    if (!IconProp) return null;
    if (typeof IconProp === "function") {
      const Component = IconProp;
      return <Component size={18} />;
    }
    if (React.isValidElement(IconProp)) {
      return IconProp;
    }
    return null;
  };

  return (
    <div className={`bg-white border border-slate-200/90 border-t-2 ${theme.borderTop} rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between ${className}`}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block truncate font-sans">
              {title}
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight font-heading tabular-nums">
              {value}
            </div>
            {subtitle && (
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                {subtitle}
              </div>
            )}
          </div>
          {IconProp && (
            <div className={`p-2 rounded-md border ${theme.iconBg} shadow-2xs shrink-0`}>
              {renderIcon()}
            </div>
          )}
        </div>
      </div>
      {link && (
        <Link 
          href={link} 
          className="bg-slate-50/80 px-4 py-2 text-xs font-medium text-slate-600 border-t border-slate-100 hover:bg-slate-100 hover:text-[#1D4ED8] flex items-center justify-between transition-colors cursor-pointer"
        >
          <span>{linkText}</span>
          <ChevronRight size={13} className="text-slate-400" />
        </Link>
      )}
    </div>
  );
}

export default StatCard;
