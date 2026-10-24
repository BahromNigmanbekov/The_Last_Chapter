import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { adminSignOut } from "./actions";

const NAV = [
  { href: "/admin", label: "Boshqaruv paneli" },
  { href: "/admin/students", label: "O‘quvchilar" },
  { href: "/admin/payments", label: "To‘lovlar" },
  { href: "/admin/movies", label: "Filmlar" },
  { href: "/admin/music", label: "Qo‘shiqlar" },
  { href: "/admin/memories", label: "Xotiralar" },
  { href: "/admin/settings", label: "Sozlamalar" },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="admin">
      <header className="admin__bar">
        <Link href="/admin" className="brand">
          THE LAST CHAPTER <span className="admin__tag">Boshqaruvchi</span>
        </Link>
        <form action={adminSignOut}>
          <button type="submit" className="linkbtn">
            Chiqish
          </button>
        </form>
      </header>
      <div className="admin__body">
        <nav className="admin__nav" aria-label="Boshqaruv bo‘limlari">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="admin__navlink">
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="admin__main">{children}</main>
      </div>
    </div>
  );
}
