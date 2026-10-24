"use server";

import { revalidatePath } from "next/cache";
import { requireStudent } from "@/lib/auth-student";
import { getAdminClient } from "@/lib/supabase/admin";
import { getEvent } from "@/lib/event";
import type { ActionResult } from "@/lib/admin-types";

export async function voteForMovie(movieId: string): Promise<ActionResult> {
  const student = await requireStudent();
  const event = await getEvent();
  if (!event.votingOpen) return { ok: false, message: "Hozircha ovoz berish yopiq." };

  const { error } = await getAdminClient().from("movie_votes").insert({ student_id: student.id, movie_id: movieId });
  if (error) {
    // The unique constraint on student_id is what actually prevents a second vote.
    const message = error.code === "23505" ? "Siz allaqachon ovoz bergansiz." : "Ovozingizni saqlab bo‘lmadi.";
    return { ok: false, message };
  }

  revalidatePath("/movie");
  return { ok: true };
}
