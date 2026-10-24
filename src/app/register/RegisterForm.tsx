"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonClass } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { verifyStudent, type RegisterState, type RegisterValues } from "./actions";

const INITIAL_STATE: RegisterState = { status: "idle" };

function valuesFrom(formData: FormData): RegisterValues {
  const get = (name: string) => String(formData.get(name) ?? "");
  return { firstName: get("firstName"), lastName: get("lastName"), className: get("className") };
}

export function RegisterForm({ registrationOpen }: { registrationOpen: boolean }) {
  const router = useRouter();
  const { toast } = useToast();

  const [state, formAction, pending] = useActionState<RegisterState, FormData>(async (previous, formData) => {
    try {
      return await verifyStudent(previous, formData);
    } catch {
      toast({ tone: "error", title: "Ulanish xatosi", description: "Internet aloqasini tekshirib, qayta urinib ko‘ring." });
      return {
        status: "error",
        message: "Serverga ulanib bo‘lmadi. Internet aloqasini tekshirib, qayta urinib ko‘ring.",
        values: valuesFrom(formData),
      };
    }
  }, INITIAL_STATE);

  // After the success moment, move on automatically. The button is there if they want to skip ahead.
  useEffect(() => {
    if (state.status !== "success") return;
    const timer = window.setTimeout(() => router.push("/dashboard"), 2400);
    return () => window.clearTimeout(timer);
  }, [state.status, router]);

  if (state.status === "success") {
    return (
      <div className="done" role="status">
        <svg className="done__mark" viewBox="0 0 84 84" aria-hidden="true">
          <circle cx="42" cy="42" r="36" />
          <path d="M28 44 l10 10 l19 -22" />
        </svg>
        <h1 className="auth__title">Siz ro‘yxatdasiz.</h1>
        <p className="auth__lead" style={{ marginInline: "auto" }}>
          Xush kelibsiz, {state.firstName}. Shaxsiy kabinetingiz ochilmoqda.
        </p>
        <Link href="/dashboard" className={buttonClass("primary")}>
          Davom etish
        </Link>
      </div>
    );
  }

  const values = state.status === "error" ? state.values : undefined;
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const showBanner = state.status === "error" && !fieldErrors;

  return (
    <>
      <h1 className="auth__title">Ro‘yxatdan o‘ting.</h1>
      <p className="auth__lead">Ismingiz, familiyangiz va sinfingizni kiriting. Shaxsiy kodingiz kabinetga kirganingizdan keyin ko‘rinadi.</p>

      <form action={formAction} className="auth__form" noValidate>
        {!registrationOpen && (
          <p className="notice">
            Yangi o‘quvchilar uchun ro‘yxatdan o‘tish yopiq. Avval ro‘yxatdan o‘tgan bo‘lsangiz, quyida kirishingiz mumkin.
          </p>
        )}
        {showBanner && (
          <p className="notice notice--error" role="alert">
            {state.message}
          </p>
        )}

        <div className="auth__row">
          <Input
            label="Ism"
            name="firstName"
            placeholder="Aziz"
            autoComplete="given-name"
            defaultValue={values?.firstName}
            error={fieldErrors?.firstName}
            required
          />
          <Input
            label="Familiya"
            name="lastName"
            placeholder="Karimov"
            autoComplete="family-name"
            defaultValue={values?.lastName}
            error={fieldErrors?.lastName}
            required
          />
        </div>
        <Input
          label="Sinf"
          name="className"
          placeholder="11-A"
          autoCapitalize="characters"
          autoComplete="off"
          defaultValue={values?.className}
          error={fieldErrors?.className}
          required
        />

        <Button type="submit" loading={pending} className="btn--block">
          {pending ? "Tekshirilmoqda" : "Ma’lumotlarimni tekshirish"}
        </Button>
      </form>
    </>
  );
}
