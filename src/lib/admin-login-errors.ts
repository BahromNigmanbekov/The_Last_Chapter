/** Action errors must be useful to the organizer without exposing credentials. */
export function adminLoginErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  const detail = error && typeof error === "object"
    ? ["message", "details", "code"].map((key) => {
        const value = (error as Record<string, unknown>)[key];
        return typeof value === "string" ? value : "";
      }).join(" ")
    : "";
  const description = `${message} ${detail}`;

  if (/ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(description)) {
    return "Ma’lumotlar bazasi manzili topilmadi. Supabase loyiha manzilini tekshiring.";
  }
  if (/fetch failed|ECONNREFUSED|ETIMEDOUT|network|timeout/i.test(description)) {
    return "Ma’lumotlar bazasiga ulanib bo‘lmadi. Internet aloqasi va Supabase ulanishini tekshiring.";
  }
  if (/Missing environment variable|SESSION_SECRET must/i.test(description)) {
    return "Boshqaruv paneli sozlamalari to‘liq emas. Serverdagi ulanish va kirish sozlamalarini tekshiring.";
  }
  if (/Invalid API key|Invalid JWT|JWT expired/i.test(description)) {
    return "Ma’lumotlar bazasiga kirish kaliti yaroqsiz. Supabase ulanish sozlamalarini tekshiring.";
  }
  if (/login_attempts/i.test(description) && /does not exist|schema cache|could not find/i.test(description)) {
    return "Ma’lumotlar bazasi hali tayyorlanmagan. Loyihaning boshlang‘ich SQL sozlamalarini bajaring.";
  }
  return "Xatolik yuz berdi. Qayta urinib ko‘ring.";
}
