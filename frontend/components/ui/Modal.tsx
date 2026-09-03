import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ isOpen = true, onClose, title, children, footer, size = "md" }: ModalProps) {
  if (!isOpen) return null;

  const sizeMap = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className={`relative bg-white rounded-md border border-slate-200 shadow-xl w-full ${sizeMap[size]} z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}>
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 m-0 tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/60 transition-colors"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 text-xs text-slate-700">
          {children}
        </div>

        {/* Footer if provided */}
        {footer && (
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
