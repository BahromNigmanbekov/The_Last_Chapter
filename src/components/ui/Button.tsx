import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";

/** Class names for anything that should look like a button (e.g. a <Link>). */
export function buttonClass(variant: Variant = "primary", extra?: string): string {
  return ["btn", `btn--${variant}`, extra].filter(Boolean).join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  loading = false,
  type = "button",
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass(variant, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
