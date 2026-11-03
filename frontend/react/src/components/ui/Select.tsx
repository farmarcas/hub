import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import { controlClass, Field } from "./Field";

export type SelectOption = { value: string; label: string };

type SelectProps = Omit<ComponentPropsWithoutRef<"select">, "id"> & {
  id: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: string;
  error?: string;
};

export function Select({
  id,
  label,
  options,
  placeholder,
  hint,
  error,
  className,
  ...props
}: SelectProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-message` : undefined}
        className={cn(controlClass, "appearance-none bg-surface")}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
