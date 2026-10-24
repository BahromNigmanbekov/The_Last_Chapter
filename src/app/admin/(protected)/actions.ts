"use server";

import { redirect } from "next/navigation";
import { destroyAdminSession } from "@/lib/admin-session";

export async function adminSignOut(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}
