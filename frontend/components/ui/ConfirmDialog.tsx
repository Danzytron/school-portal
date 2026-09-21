import React from "react";
import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  variant?: "danger" | "warning" | "info" | string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen = true,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText,
  confirmLabel,
  cancelText = "Cancel",
  type,
  variant,
  isLoading = false,
}: ConfirmDialogProps) {
  const handleClose = onCancel || onClose || (() => {});
  const buttonLabel = confirmLabel || confirmText || "Confirm";
  const dialogType = (variant as "danger" | "warning" | "info") || type || "danger";

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <div className="flex gap-3 items-start py-1">
        <div className={`p-2 rounded border flex-shrink-0 ${
          dialogType === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-amber-50 border-amber-200 text-amber-600'
        }`}>
          <AlertTriangle size={20} />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-700 m-0 leading-relaxed font-normal">{message}</p>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
        <button 
          type="button" 
          onClick={handleClose} 
          disabled={isLoading}
          className="btn-default"
        >
          {cancelText}
        </button>
        <button 
          type="button" 
          onClick={onConfirm} 
          disabled={isLoading}
          className={dialogType === 'danger' ? 'btn-danger' : 'btn-primary'}
        >
          {isLoading ? "Processing..." : buttonLabel}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
