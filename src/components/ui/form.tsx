"use client";

import {
  FormProvider,
  SubmitHandler,
  UseFormReturn,
  FieldValues,
} from "react-hook-form";

type FormProps<T extends FieldValues> = {
  children: React.ReactNode;
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
};

export function Form<T extends FieldValues>({
  children,
  form,
  onSubmit,
}: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>{children}</form>
    </FormProvider>
  );
}
