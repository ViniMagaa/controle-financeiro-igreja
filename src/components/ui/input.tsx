import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export function Input({ error, className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition bg-background border-border focus:ring-2 focus:ring-ring focus:border-ring ${error ? "border-red-500 focus:ring-red-500" : ""} ${className}`}
      {...props}
    />
  );
}
