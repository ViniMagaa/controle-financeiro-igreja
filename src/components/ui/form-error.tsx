type FormErrorProps = {
  message?: string;
};

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return <span className="text-sm text-destructive">{message}</span>;
}
