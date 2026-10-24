"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/admin-types";

const movieSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional().default(""),
  posterUrl: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  duration: z.coerce.number().int().positive().optional().or(z.nan().transform(() => undefined)),
});

function readMovieForm(formData: FormData) {
  return movieSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    posterUrl: formData.get("posterUrl"),
    duration: formData.get("duration") || undefined,
  });
}

export async function addMovie(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = readMovieForm(formData);
  if (!parsed.success) return { ok: false, message: "Film nomi va afisha havolasini tekshiring." };

  const { error } = await getAdminClient().from("movies").insert({
    title: parsed.data.title,
    description: parsed.data.description,
    poster_url: parsed.data.posterUrl,
    duration_minutes: parsed.data.duration ?? null,
  });
  if (error) return { ok: false, message: "Filmni qo‘shib bo‘lmadi." };

  revalidatePath("/admin/movies");
  return { ok: true };
}

export async function updateMovie(movieId: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = readMovieForm(formData);
  if (!parsed.success) return { ok: false, message: "Film nomi va afisha havolasini tekshiring." };

  const { error } = await getAdminClient()
    .from("movies")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      poster_url: parsed.data.posterUrl,
      duration_minutes: parsed.data.duration ?? null,
    })
    .eq("id", movieId);
  if (error) return { ok: false, message: "O‘zgarishlarni saqlab bo‘lmadi." };

  revalidatePath("/admin/movies");
  return { ok: true };
}

export async function deleteMovie(movieId: string): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await getAdminClient().from("movies").delete().eq("id", movieId);
  if (error) return { ok: false, message: "Filmni o‘chirib bo‘lmadi." };
  revalidatePath("/admin/movies");
  return { ok: true };
}

/** Marks exactly one movie as the confirmed final pick (a unique index enforces "at most one"). */
export async function selectMovie(movieId: string): Promise<ActionResult> {
  await requireAdmin();
  const admin = getAdminClient();
  const { error: clearError } = await admin.from("movies").update({ is_selected: false }).eq("is_selected", true);
  if (clearError) return { ok: false, message: "Tanlovni yangilab bo‘lmadi." };

  const { error } = await admin.from("movies").update({ is_selected: true }).eq("id", movieId);
  if (error) return { ok: false, message: "Bu filmni tasdiqlab bo‘lmadi." };

  revalidatePath("/admin/movies");
  return { ok: true };
}

export async function clearMovieSelection(): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await getAdminClient().from("movies").update({ is_selected: false }).eq("is_selected", true);
  if (error) return { ok: false, message: "Tanlovni bekor qilib bo‘lmadi." };
  revalidatePath("/admin/movies");
  return { ok: true };
}

export async function setVotingOpen(open: boolean): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await getAdminClient().from("events").update({ voting_open: open }).eq("slug", "main");
  if (error) return { ok: false, message: "Ovoz berish holatini yangilab bo‘lmadi." };
  revalidatePath("/admin/movies");
  revalidatePath("/movie");
  return { ok: true };
}
