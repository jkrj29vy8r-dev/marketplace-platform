"use client";

import { useEffect, useState } from "react";

interface StatCounterProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
}

// Animates a number counting up to its target on mount, used for the
// landing page's "live" platform stats. Pure client-side easing — no
// external animation lib needed for a single number tween.
export function StatCounter({ label, value, prefix = "", suffix = "" }: StatCounterProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div className="flex flex-col gap-1">
      <span className="font-display text-3xl text-white">
        {prefix}
        {display.toLocaleString()}
        {suffix}
      </span>
      <span className="text-sm text-white/50">{label}</span>
    </div>
  );
}
