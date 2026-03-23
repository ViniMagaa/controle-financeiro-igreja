"use client";

import { Command } from "cmdk";
import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

export type ComboboxOption = {
  value: string;
  label: string;
};

type ComboboxProps = {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  error?: boolean;
  disabled?: boolean;
};

export function Combobox({
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum resultado.",
  error,
  disabled,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        onBlur?.();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`bg-background border-border focus:ring-ring focus:border-ring flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? "border-red-500 focus:ring-red-500" : ""} `}
      >
        <span
          className={selected ? "text-foreground" : "text-muted-foreground"}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronsUpDown className="text-muted-foreground ml-2 size-4 shrink-0" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="border-border bg-background absolute top-[calc(100%+4px)] left-0 z-50 w-full overflow-hidden rounded-md border shadow-md">
          <Command>
            {/* Search input */}
            <div className="border-border flex items-center gap-2 border-b px-3 py-2">
              <Search className="text-muted-foreground size-3.5 shrink-0" />
              <Command.Input
                placeholder={searchPlaceholder}
                className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
              />
            </div>

            <Command.List className="max-h-52 overflow-y-auto p-1">
              <Command.Empty className="text-muted-foreground px-3 py-6 text-center text-sm">
                {emptyMessage}
              </Command.Empty>

              {options.map((opt) => (
                <Command.Item
                  key={opt.value}
                  value={opt.label} // cmdk filtra pelo value — usa label pra busca funcionar
                  onSelect={() => {
                    onChange?.(opt.value);
                    setOpen(false);
                    onBlur?.();
                  }}
                  className="hover:bg-muted/60 data-[selected=true]:bg-muted/60 flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm"
                >
                  <span>{opt.label}</span>
                  {value === opt.value && (
                    <Check className="text-primary size-3.5 shrink-0" />
                  )}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </div>
      )}
    </div>
  );
}
