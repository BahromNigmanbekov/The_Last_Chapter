"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/admin-types";
import { parseEventDateTime } from "@/lib/event-datetime";

const settingsSchema = z.object({
  name: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(120).optional().default(""),
  location: z.string().trim().min(1).max(200),
  startsAt: z.string().min(1), // datetime-local value, e.g. "2027-05-25T20:00"
  endsAt: z.string().min(1),
  minContribution: z.coerce.number().int().positive(),
});

export async function updateEventSettings(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    name: formData.get("name"),
    subtitle: formData.get("subtitle"),
    location: formData.get("location"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    minContribution: formData.get("minContribution"),
  });
  if (!parsed.success) return { ok: false, message: "Barcha maydonlarni tekshiring." };

  const startsAt = parseEventDateTime(parsed.data.startsAt);
  const endsAt = parseEventDateTime(parsed.data.endsAt);
  if (!startsAt || !endsAt || endsAt <= startsAt) {
    return { ok: false, message: "Tugash vaqti boshlanish vaqtidan keyin bo‘lishi kerak." };
  }

  const { error } = await getAdminClient()
    .from("events")
    .update({
      name: parsed.data.name,
      subtitle: parsed.data.subtitle,
      location: parsed.data.location,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      min_contribution: parsed.data.minContribution,
    })
    .eq("slug", "main");
  if (error) return { ok: false, message: "Tadbir sozlamalarini saqlab bo‘lmadi." };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setRegistrationOpen(open: boolean): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await getAdminClient().from("events").update({ registration_open: open }).eq("slug", "main");
  if (error) return { ok: false, message: "Holatni yangilab bo‘lmadi." };
  revalidatePath("/admin/settings");
  revalidatePath("/register");
  return { ok: true };
}
