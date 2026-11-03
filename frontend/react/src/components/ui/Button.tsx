import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

const buttonVariant = {
  primary: "bg-primary text-primary-foreground font-semibold shadow-glow hover:bg-primary-hover",
  secondary:
    "border border-border-strong text-secondary-foreground hover:border-primary-border hover:text-foreground",
  ghost: "text-muted-foreground hover:bg-primary-wash hover:text-foreground",
  // Ação destrutiva discreta (ex.: "Excluir" numa linha de tabela); a confirmação usa `destructive`.
  "ghost-destructive": "text-muted-foreground hover:bg-destructive-tint hover:text-destructive",
  destructive: "bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90",
} as const;

const buttonSize = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-[13px]",
} as const;

// Aceita os atributos nativos de <button> (onClick, disabled, aria-*, type).
type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: keyof typeof buttonVariant;
  size?: keyof typeof buttonSize;
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md whitespace-nowrap",
        "transition-colors duration-200",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none",
        buttonSize[size],
        buttonVariant[variant],
        className,
      )}
      {...props}
    />
  );
}
