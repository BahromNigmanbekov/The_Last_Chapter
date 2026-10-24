/** Apple devices use their native emoji; other devices use the local fallback. */
export function Emoji({ children, className = "" }: { children: string; className?: string }) {
  return <span className={`emoji ${className}`} aria-hidden="true">{children}</span>;
}
