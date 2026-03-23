"use client";

import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";
import { CurrencyInput } from "./currency-input";
import { Label } from "./label";
import { FormError } from "./form-error";
import { getErrorMessage } from "@/utils/get-error-message";

type CurrencyFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
};

export function CurrencyField<T extends FieldValues>({
  name,
  label,
  placeholder,
  required,
}: CurrencyFieldProps<T>) {
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
          <CurrencyInput
            id={name}
            error={!!message}
            placeholder={placeholder ?? "R$ 0,00"}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <FormError message={message} />
    </div>
  );
}
