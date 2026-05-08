import React from "react";

interface WebsiteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  prefix?: string; // Custom prefix, e.g., 'https://t.me/'
}

/**
 * WebsiteInput renders an input with a fixed prefix (default: https://).
 * Only the part after the prefix is editable.
 */
export function WebsiteInput({ value, onChange, placeholder = "yourwebsite.com", id, className, prefix = "https://" }: WebsiteInputProps) {
  // Remove prefix for input, but always save with prefix
  const inputValue = value?.startsWith(prefix) ? value.slice(prefix.length) : value || "";
  return (
    <div className="flex rounded-md shadow-xs">
      <span className="border-input bg-background text-foreground inline-flex items-center rounded-s-md border px-3 text-sm">{prefix}</span>
      <input
        type="text"
        className={
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive -ms-px rounded-s-none shadow-none" + (className ? ` ${className}` : "")
        }
        placeholder={placeholder}
        value={inputValue}
        onChange={e => onChange(e.target.value ? `${prefix}${e.target.value}` : "")}
        id={id}
        data-slot="input"
      />
    </div>
  );
}
