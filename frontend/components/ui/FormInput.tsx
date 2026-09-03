"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function FormInput({ label, error, helperText, required, className = "", id, type = "text", ...props }: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const isPassword = type === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
          {label}
          {required && <span className="text-rose-600 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          id={inputId}
          type={currentType}
          required={required}
          className={`form-control ${isPassword ? 'pr-9' : ''} ${error ? 'border-rose-500 focus:border-rose-600 focus:ring-rose-500/20' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"
            title={showPassword ? "Hide password" : "Show password"}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-rose-600 font-medium m-0 mt-1">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-slate-500 m-0 mt-1">{helperText}</p>}
    </div>
  );
}

export default FormInput;
