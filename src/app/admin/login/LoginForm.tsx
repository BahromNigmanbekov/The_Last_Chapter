"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { verifyAdminPassword, type AdminLoginState } from "./actions";

const INITIAL_STATE: AdminLoginState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(verifyAdminPassword, INITIAL_STATE);

  return (
    <form action={formAction} className="auth__form" noValidate>
      {state.status === "error" && (
        <p className="notice notice--error" role="alert">
          {state.message}
        </p>
      )}
      <Input label="Parol" name="password" type="password" autoComplete="current-password" autoFocus required />
      <Button type="submit" loading={pending} className="btn--block">
        {pending ? "Tekshirilmoqda" : "Kirish"}
      </Button>
    </form>
  );
}
