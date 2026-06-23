import { HTMLAttributes } from "react";
import clsx from "clsx";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: "cyan" | "violet" | "none";
}

// Base surface used across every dashboard and the landing page.
// Centralizing the glass effect here means a single tweak (blur, border
// opacity) propagates everywhere consistently.
export function GlassCard({ className, glow = "none", children, ...props }: GlassCardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl2 border border-white/10 bg-white/[0.03] backdrop-blur-md",
        glow === "cyan" && "shadow-glow",
        glow === "violet" && "shadow-glow-violet",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
