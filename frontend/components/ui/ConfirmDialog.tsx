import React from "react";
import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen = true,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const handleClose = onCancel || onClose || (() => {});

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <div className="flex gap-3 items-start py-1">
        <div className={`p-2 rounded border flex-shrink-0 ${
          type === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-amber-50 border-amber-200 text-amber-600'
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
          className={type === 'danger' ? 'btn-danger' : 'btn-primary'}
        >
          {isLoading ? "Processing..." : confirmText}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
