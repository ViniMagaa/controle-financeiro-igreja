"use client";

import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";
import { FileUpload } from "./file-upload";
import { Label } from "./label";
import { FormError } from "./form-error";
import { getErrorMessage } from "@/utils/get-error-message";

type FileUploadFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  required?: boolean;
};

export function FileUploadField<T extends FieldValues>({
  name,
  label,
  required,
}: FileUploadFieldProps<T>) {
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
          <FileUpload
            value={field.value}
            onChange={field.onChange}
            error={!!message}
          />
        )}
      />

      <FormError message={message} />
    </div>
  );
}
