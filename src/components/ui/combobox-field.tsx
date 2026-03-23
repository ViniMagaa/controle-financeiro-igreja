"use client";

import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";
import { Combobox, ComboboxOption } from "./combobox";
import { Label } from "./label";
import { FormError } from "./form-error";
import { getErrorMessage } from "@/utils/get-error-message";

type ComboboxFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  required?: boolean;
};

export function ComboboxField<T extends FieldValues>({
  name,
  label,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  required,
}: ComboboxFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];
  const message = getErrorMessage(error);

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Combobox
            options={options}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            placeholder={placeholder}
            searchPlaceholder={searchPlaceholder}
            emptyMessage={emptyMessage}
            error={!!message}
          />
        )}
      />

      <FormError message={message} />
    </div>
  );
}
