"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { deleteStudent } from "../actions";

export function DeleteButton({ studentId }: { studentId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      loading={pending}
      onClick={() => {
        if (!window.confirm("O‘quvchi o‘chirilsinmi? Uning chiptasi, to‘lovlari va ovozlari ham o‘chiriladi.")) return;
        startTransition(async () => {
          const result = await deleteStudent(studentId);
          if (result.ok) {
            toast({ tone: "success", title: "O‘quvchi o‘chirildi" });
            router.push("/admin/students");
          } else {
            toast({ tone: "error", title: "O‘quvchini o‘chirib bo‘lmadi", description: result.message });
          }
        });
      }}
    >
      O‘quvchini o‘chirish
    </Button>
  );
}
