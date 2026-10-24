"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { updateStudent } from "../actions";

interface StudentLike {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  registration_code: string;
}

export function EditStudentForm({ student }: { student: StudentLike }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="admin__form"
      action={(formData) =>
        startTransition(async () => {
          const result = await updateStudent(student.id, formData);
          if (result.ok) {
            toast({ tone: "success", title: "Saqlandi" });
            router.refresh();
          } else {
            toast({ tone: "error", title: "Saqlab bo‘lmadi", description: result.message });
          }
        })
      }
    >
      <div className="admin__row2">
        <Input label="Ism" name="firstName" defaultValue={student.first_name} required />
        <Input label="Familiya" name="lastName" defaultValue={student.last_name} required />
      </div>
      <div className="admin__row2">
        <Input label="Sinf" name="className" defaultValue={student.class_name} required />
        <Input label="Shaxsiy kod" name="code" defaultValue={student.registration_code} hint="O‘quvchi bu kodni kabinetida ko‘radi." />
      </div>
      <Button type="submit" loading={pending}>
        O‘zgarishlarni saqlash
      </Button>
    </form>
  );
}
