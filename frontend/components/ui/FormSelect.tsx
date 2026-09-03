import React from "react";

export interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: (Option | string | number)[];
  error?: string;
  helperText?: string;
}

export function FormSelect({ label, options, error, helperText, required, className = "", id, ...props }: FormSelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700">
          {label}
          {required && <span className="text-rose-600 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={selectId}
        required={required}
        className={`form-control cursor-pointer pr-8 ${error ? 'border-rose-500 focus:border-rose-600 focus:ring-rose-500/20' : ''} ${className}`}
        {...props}
      >
        {options.map((opt, idx) => {
          if (typeof opt === 'object' && opt !== null && 'value' in opt) {
            return (
              <option key={idx} value={opt.value}>
                {opt.label}
              </option>
            );
          }
          return (
            <option key={idx} value={opt}>
              {opt}
            </option>
          );
        })}
      </select>
      {error && <p className="text-[11px] text-rose-600 font-medium m-0 mt-1">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-slate-500 m-0 mt-1">{helperText}</p>}
    </div>
  );
}

export default FormSelect;
