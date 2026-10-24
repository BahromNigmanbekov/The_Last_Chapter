import Link from "next/link";
import { redirect } from "next/navigation";
import { getEvent } from "@/lib/event";
import { getCurrentStudent } from "@/lib/auth-student";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Ro‘yxatdan o‘tish — THE LAST CHAPTER" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  // Already verified on this device? Skip the form.
  if (await getCurrentStudent()) redirect("/dashboard");

  const event = await getEvent();

  return (
    <div className="auth">
      <div className="auth__bar">
        <Link href="/" className="brand">
          {event.name}
        </Link>
        <Link href="/" className="auth__back">
          Orqaga
        </Link>
      </div>
      <main className="auth__card">
        <RegisterForm registrationOpen={event.registrationOpen} />
      </main>
    </div>
  );
}
