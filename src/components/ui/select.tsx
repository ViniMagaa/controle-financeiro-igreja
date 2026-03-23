import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
  placeholder?: string;
  options: { value: string; label: string }[];
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, placeholder, options, className = "", ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={`bg-background border-border focus:ring-ring focus:border-ring w-full appearance-none rounded-md border px-3 py-2 pr-9 text-sm transition outline-none focus:ring-2 ${error ? "border-red-500 focus:ring-red-500" : ""} ${className} `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2" />
      </div>
    );
  },
);

Select.displayName = "Select";
