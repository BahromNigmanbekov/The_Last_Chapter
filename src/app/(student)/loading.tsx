export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Yuklanmoqda…</span>
      <div className="skeleton" style={{ height: 72, width: "min(420px, 80%)", marginTop: 24 }} />
      <div className="skeleton" style={{ height: 200, marginTop: 28 }} />
      <div className="tiles">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="skeleton" style={{ height: 96 }} />
        ))}
      </div>
    </div>
  );
}
