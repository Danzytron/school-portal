import React from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search records...", className = "" }: SearchBarProps) {
  return (
    <div className={`relative flex items-center w-full max-w-xs ${className}`}>
      <Search size={13} className="absolute left-2.5 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-control pl-8 pr-7 text-xs py-1.5"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
