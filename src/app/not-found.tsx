import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="notfound">
      <h1 className="notfound__title">Bu sahifa topilmadi.</h1>
      <p className="notfound__text">Havola noto‘g‘ri yoki sahifa boshqa manzilga ko‘chirilgan bo‘lishi mumkin.</p>
      <Link href="/" className={buttonClass("primary")}>
        Bosh sahifaga qaytish
      </Link>
    </main>
  );
}
