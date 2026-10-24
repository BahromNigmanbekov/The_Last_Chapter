import Link from "next/link";
import { requireStudent } from "@/lib/auth-student";
import { signOut } from "./actions";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  // Redirects to /register when there is no valid session.
  // Pages call requireStudent() too: layouts don't re-run on every client navigation.
  await requireStudent();

  return (
    <div>
      <header className="shell__bar">
        <Link href="/dashboard" className="brand">
          THE LAST CHAPTER
        </Link>
        <form action={signOut}>
          <button type="submit" className="linkbtn">
            Chiqish
          </button>
        </form>
      </header>
      <main className="shell__main">{children}</main>
    </div>
  );
}
