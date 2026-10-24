"use client";

import { Button } from "@/components/ui/Button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="notfound">
      <h1 className="notfound__title">Xatolik yuz berdi.</h1>
      <p className="notfound__text">Sahifa yuklanmadi. Qayta urinib ko‘ring. Muammo takrorlansa, tashkilotchilarga xabar bering.</p>
      <Button onClick={reset}>Qayta urinish</Button>
    </main>
  );
}
