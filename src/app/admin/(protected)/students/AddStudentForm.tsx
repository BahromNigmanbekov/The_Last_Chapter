"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { addStudent } from "./actions";

export function AddStudentForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [key, setKey] = useState(0); // bump to reset the uncontrolled inputs after a successful add

  return (
    <section className="panel">
      <h2 className="panel__title">O‘quvchi qo‘shish</h2>
      <form
        key={key}
        className="admin__form"
        action={(formData) =>
          startTransition(async () => {
            const result = await addStudent(formData);
            if (result.ok) {
              toast({ tone: "success", title: "O‘quvchi qo‘shildi" });
              setKey((k) => k + 1);
              router.refresh();
            } else {
              toast({ tone: "error", title: "O‘quvchini qo‘shib bo‘lmadi", description: result.message });
            }
          })
        }
      >
        <div className="admin__row2">
          <Input label="Ism" name="firstName" required />
          <Input label="Familiya" name="lastName" required />
        </div>
        <div className="admin__row2">
          <Input label="Sinf" name="className" placeholder="11-A" required />
          <Input label="Shaxsiy kod (ixtiyoriy)" name="code" hint="Bo‘sh qoldirsangiz, avtomatik yaratiladi." />
        </div>
        <Button type="submit" loading={pending}>
          O‘quvchi qo‘shish
        </Button>
      </form>
    </section>
  );
}
