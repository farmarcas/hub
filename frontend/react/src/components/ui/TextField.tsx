import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import { controlClass, Field } from "./Field";

type TextFieldProps = Omit<ComponentPropsWithoutRef<"input">, "id"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({ id, label, hint, error, className, ...props }: TextFieldProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-message` : undefined}
        className={controlClass}
        {...props}
      />
    </Field>
  );
}

type TextAreaProps = Omit<ComponentPropsWithoutRef<"textarea">, "id"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function TextArea({ id, label, hint, error, className, ...props }: TextAreaProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <textarea
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-message` : undefined}
        className={cn(controlClass, "resize-y")}
        {...props}
      />
    </Field>
  );
}
