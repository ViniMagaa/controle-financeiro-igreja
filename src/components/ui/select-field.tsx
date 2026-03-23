"use client";

import { FieldValues, Path, useFormContext } from "react-hook-form";
import { Select } from "./select";
import { Label } from "./label";
import { FormError } from "./form-error";
import { getErrorMessage } from "@/utils/get-error-message";

type SelectFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  required?: boolean;
};

export function SelectField<T extends FieldValues>({
  name,
  label,
  placeholder,
  options,
  required,
}: SelectFieldProps<T>) {
  const {
    register,
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

      <Select
        id={name}
        error={!!message}
        placeholder={placeholder ?? "Selecione..."}
        options={options}
        {...register(name)}
      />

      <FormError message={message} />
    </div>
  );
}
