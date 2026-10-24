"use server";

import { redirect } from "next/navigation";
import { destroyStudentSession } from "@/lib/session";

export async function signOut(): Promise<void> {
  await destroyStudentSession();
  redirect("/");
}
