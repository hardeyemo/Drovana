import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "onDark";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-emerald-700 text-white hover:bg-emerald-800",
  secondary:
    "border border-navy-900/20 bg-white text-navy-900 hover:border-navy-900/50",
  ghost: "text-navy-900 hover:bg-paper-deep",
  onDark: "bg-white text-navy-900 hover:bg-paper-deep",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-12 px-6 text-base",
};

/** Class helper so <Link> and <button> share identical styling. */
export function buttonStyles(
  opts: { variant?: Variant; size?: Size; className?: string } = {},
): string {
  const { variant = "primary", size = "md", className } = opts;
  return cn(
    "inline-flex min-w-0 items-center justify-center gap-2 rounded-control font-semibold",
    "transition-[color,background-color,border-color,transform,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[.98] hover:shadow-sm disabled:pointer-events-none disabled:transform-none disabled:shadow-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  );
}
