import React from "react";
import Link from "next/link";

export interface HeaderAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "default" | "danger" | "outline";
  icon?: any;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  actions?: React.ReactNode | HeaderAction | HeaderAction[];
  action?: React.ReactNode | HeaderAction | HeaderAction[];
  className?: string;
}

export function PageHeader({ title, subtitle, description, badge, actions, action, className = "" }: PageHeaderProps) {
  const subText = subtitle || description;
  const rawActions = actions !== undefined ? actions : action;

  const renderActionItem = (act: HeaderAction, idx: number) => {
    let btnClass = "btn-primary";
    if (act.variant === "danger") btnClass = "btn-danger";
    else if (act.variant === "default") btnClass = "btn-secondary";
    else if (act.variant === "outline") btnClass = "btn-outline";
    
    const Icon = act.icon;
    const content = (
      <>
        {Icon && <Icon size={13} className="mr-1" />}
        <span>{act.label}</span>
      </>
    );

    if (act.href) {
      return (
        <Link key={idx} href={act.href} className={btnClass}>
          {content}
        </Link>
      );
    }
    return (
      <button key={idx} onClick={act.onClick} className={btnClass}>
        {content}
      </button>
    );
  };

  const renderActions = () => {
    if (!rawActions) return null;

    if (React.isValidElement(rawActions) || typeof rawActions === "string" || typeof rawActions === "number") {
      return rawActions;
    }

    if (Array.isArray(rawActions)) {
      return rawActions.map((act, idx) => {
        if (React.isValidElement(act)) return act;
        if (typeof act === "object" && act !== null && 'label' in act) {
          return renderActionItem(act as HeaderAction, idx);
        }
        return null;
      });
    }

    if (typeof rawActions === "object" && rawActions !== null && 'label' in rawActions) {
      return renderActionItem(rawActions as HeaderAction, 0);
    }

    return null;
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-2.5 mb-4 gap-2 ${className}`}>
      <div>
        <h1 className="text-base sm:text-lg font-semibold text-gray-900 m-0">
          {title}
        </h1>
        {subText && (
          <p className="text-xs text-gray-500 mt-0.5 m-0 leading-relaxed">
            {subText}
          </p>
        )}
      </div>
      {rawActions && (
        <div className="flex items-center gap-2 flex-wrap">
          {renderActions()}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
