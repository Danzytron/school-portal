import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  message?: string;
  icon?: any;
  action?: React.ReactNode;
}

export function EmptyState({ title = "No Data Found", description, message, icon: IconProp, action }: EmptyStateProps) {
  const desc = description || message || "There are no records to display at this time.";

  const renderIcon = () => {
    if (!IconProp) return <FolderOpen size={32} className="text-slate-300 stroke-[1.5]" />;
    if (typeof IconProp === "function") {
      const Component = IconProp;
      return <Component size={32} className="text-slate-300 stroke-[1.5]" />;
    }
    if (React.isValidElement(IconProp)) {
      return IconProp;
    }
    return <FolderOpen size={32} className="text-slate-300 stroke-[1.5]" />;
  };

  return (
    <div className="p-8 text-center bg-white border border-slate-200 rounded-md shadow-2xs flex flex-col items-center justify-center gap-2">
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-full mb-1">
        {renderIcon()}
      </div>
      <h3 className="text-sm font-bold text-slate-800 m-0">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm m-0">{desc}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export default EmptyState;
