import React from "react";
import Link from "next/link";

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

  const renderIcon = () => {
    if (!IconProp) return null;
    if (typeof IconProp === "function") {
      const Component = IconProp;
      return <Component size={16} className="text-gray-400" />;
    }
    if (React.isValidElement(IconProp)) {
      return IconProp;
    }
    return null;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded overflow-hidden ${className}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500 block truncate">
              {title}
            </span>
            <div className="text-xl font-bold text-gray-900 mt-0.5 tabular-nums">
              {value}
            </div>
            {subtitle && (
              <div className="text-[11px] text-gray-500 mt-0.5">
                {subtitle}
              </div>
            )}
          </div>
          {IconProp && (
            <div className="shrink-0 mt-0.5">
              {renderIcon()}
            </div>
          )}
        </div>
      </div>
      {link && (
        <Link 
          href={link} 
          className="block bg-gray-50 px-4 py-2 text-xs text-gray-600 border-t border-gray-100 hover:bg-gray-100 hover:text-[#1D4ED8] transition-colors cursor-pointer"
        >
          {linkText} →
        </Link>
      )}
    </div>
  );
}

export default StatCard;
