import "server-only";
import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-session";

/** Use at the top of every admin page/layout. Redirects to the password screen if not signed in. */
export async function requireAdmin(): Promise<void> {
  if (!(await hasAdminSession())) redirect("/admin/login");
}
