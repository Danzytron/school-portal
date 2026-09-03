"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";

export type ToastType = "success" | "error" | "warning" | "info";

interface SingleToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

const SingleToast = ({ id, message, type, onClose }: SingleToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const typeStyles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-rose-50 border-rose-200 text-rose-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-sky-50 border-sky-200 text-sky-800"
  };

  return (
    <div className={`p-3 border rounded-md shadow-md flex items-start justify-between min-w-[280px] max-w-[380px] text-xs transition-all pointer-events-auto ${typeStyles[type]}`}>
      <div className="font-medium pr-2 leading-tight">{message}</div>
      <button onClick={() => onClose(id)} className="opacity-60 hover:opacity-100 p-0.5 rounded">
        <X size={14} />
      </button>
    </div>
  );
};

class ToastManager {
  private toasts: Array<{ id: string; message: string; type: ToastType }> = [];
  private root: any = null;

  constructor() {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        const container = document.getElementById("toast-container");
        if (container && !this.root) {
          this.root = createRoot(container);
          this.render();
        }
      }, 0);
    }
  }

  show(message: string, type: ToastType = "info") {
    const id = Math.random().toString(36).substring(2, 9);
    this.toasts.push({ id, message, type });
    this.render();
    return id;
  }

  success(message: string) { return this.show(message, "success"); }
  error(message: string) { return this.show(message, "error"); }
  warning(message: string) { return this.show(message, "warning"); }
  info(message: string) { return this.show(message, "info"); }

  remove = (id: string) => {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.render();
  }

  private render() {
    if (this.root) {
      this.root.render(
        <>
          {this.toasts.map(toastItem => (
            <SingleToast 
              key={toastItem.id}
              id={toastItem.id}
              message={toastItem.message}
              type={toastItem.type}
              onClose={this.remove}
            />
          ))}
        </>
      );
    }
  }
}

export const toast = new ToastManager();

export interface ToastComponentProps {
  message?: string;
  type?: ToastType;
  onClose?: () => void;
}

export function Toast({ message, type = "info", onClose }: ToastComponentProps) {
  if (!message) return null;
  return (
    <SingleToast
      id="standalone"
      message={message}
      type={type}
      onClose={onClose || (() => {})}
    />
  );
}

export default Toast;
