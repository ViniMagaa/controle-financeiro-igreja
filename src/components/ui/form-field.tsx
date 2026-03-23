"use client";

import { getErrorMessage } from "@/utils/get-error-message";
import { FieldValues, Path, useFormContext } from "react-hook-form";
import { FormError } from "./form-error";
import { Input } from "./input";
import { Label } from "./label";

type FormFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
};

export function FormField<T extends FieldValues>({
  name,
  label,
  type = "text",
  placeholder,
  required,
}: FormFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];
  const message = getErrorMessage(error);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}

      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        error={!!message}
        {...register(name)}
      />

      <FormError message={message} />
    </div>
  );
}
