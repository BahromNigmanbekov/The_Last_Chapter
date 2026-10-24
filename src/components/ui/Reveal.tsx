import type { ReactNode } from "react";

export function Reveal({ children, delay = 0, className, direction = "up" }: {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right";
}) {
  return <div data-reveal={direction} data-delay={delay} className={className}>{children}</div>;
}
