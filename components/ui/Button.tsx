import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200",
        variant === "primary" &&
          "bg-accent-cyan text-base-950 hover:shadow-glow hover:-translate-y-0.5",
        variant === "outline" &&
          "border border-white/15 text-white hover:border-accent-cyan/60 hover:text-accent-cyan",
        variant === "ghost" && "text-white/70 hover:text-white",
        className
      )}
      {...props}
    />
  );
}
