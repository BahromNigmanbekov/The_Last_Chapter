import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-session";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Boshqaruvchi — THE LAST CHAPTER" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await hasAdminSession()) redirect("/admin");

  return (
    <div className="auth">
      <div className="auth__bar">
        <span className="brand">THE LAST CHAPTER</span>
        <span className="auth__back" style={{ color: "var(--dim)" }}>
          Boshqaruvchi
        </span>
      </div>
      <main className="auth__card">
        <h1 className="auth__title">Boshqaruv paneliga kirish</h1>
        <p className="auth__lead">Davom etish uchun boshqaruvchi parolini kiriting.</p>
        <LoginForm />
      </main>
    </div>
  );
}
