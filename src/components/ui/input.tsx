import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export function Input({ error, className = "", ...props }: InputProps) {
  return (
    <input
      className={`bg-background border-border focus:ring-ring focus:border-ring w-full rounded-md border px-3 py-2 text-sm transition outline-none focus:ring-2 ${error ? "border-red-500 focus:ring-red-500" : ""} ${className}`}
      {...props}
    />
  );
}
