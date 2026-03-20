import { ButtonHTMLAttributes } from "react";

const buttonVariants = {
  default: "bg-primary text-background hover:bg-primary/80",
  outline:
    "border border-border bg-background hover:bg-muted/50 hover:text-foreground dark:bg-muted/20",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/50",
  ghost: "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 ",
  destructive:
    "bg-destructive/10 hover:bg-destructive/20 dark:bg-destructive/20 text-destructive dark:hover:bg-destructive/30",
  link: "text-primary underline-offset-4 hover:underline",
};

export function Button({
  variant = "default",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
}) {
  return (
    <button
      className={`flex cursor-pointer items-center justify-center gap-1 rounded-full px-4 py-1.5 font-medium transition disabled:opacity-50 ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  );
}
