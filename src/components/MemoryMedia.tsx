export function MemoryMedia({ kind, url }: { kind: "text" | "image" | "video"; url: string | null }) {
  if (kind === "text") return null;
  if (!url) return <p className="panel__hint">Faylni ochib bo‘lmadi. Sahifani yangilab ko‘ring.</p>;
  return kind === "video"
    ? <video className="memory-media" controls playsInline preload="metadata" src={url}>Brauzeringiz videoni ko‘rsata olmaydi.</video>
    // Signed private URLs are already authorized and served directly by Storage.
    // eslint-disable-next-line @next/next/no-img-element
    : <img className="memory-media" src={url} alt="Ulashilgan maktab xotirasi" loading="lazy" />;
}
