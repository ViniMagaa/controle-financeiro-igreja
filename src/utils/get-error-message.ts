import { FieldError } from "react-hook-form";

export function getErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;

  if (typeof error === "string") return error;

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as FieldError).message;

    if (typeof message === "string") {
      return message;
    }
  }

  return undefined;
}
