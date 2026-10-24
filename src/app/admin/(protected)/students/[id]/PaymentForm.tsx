"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { recordPayment } from "../actions";

export function PaymentForm({ studentId, defaultAmount }: { studentId: string; defaultAmount: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="admin__form admin__form--inline"
      action={(formData) =>
        startTransition(async () => {
          const result = await recordPayment(studentId, formData);
          if (result.ok) {
            toast({ tone: "success", title: "To‘lov qayd etildi" });
            router.refresh();
          } else {
            toast({ tone: "error", title: "To‘lovni qayd etib bo‘lmadi", description: result.message });
          }
        })
      }
    >
      <Input label="Summa (so‘m)" name="amount" type="number" min={1} defaultValue={defaultAmount} required />
      <div className="field">
        <label className="field__label" htmlFor="payment-status">
          Holat
        </label>
        <select id="payment-status" name="status" className="field__input" defaultValue="paid">
          <option value="paid">To‘langan</option>
          <option value="pending">Kutilmoqda</option>
          <option value="failed">Amalga oshmagan</option>
          <option value="cancelled">Bekor qilingan</option>
        </select>
      </div>
      <Button type="submit" loading={pending}>
        To‘lovni saqlash
      </Button>
    </form>
  );
}
