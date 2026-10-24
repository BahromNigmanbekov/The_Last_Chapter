/** Database values stay unchanged; only their visible labels are translated. */
const labels: Record<string, string> = {
  pending: "Kutilmoqda",
  approved: "Tasdiqlangan",
  rejected: "Rad etilgan",
  paid: "To‘langan",
  not_paid: "To‘lanmagan",
  failed: "Amalga oshmagan",
  cancelled: "Bekor qilingan",
  valid: "Amal qiladi",
  used: "Foydalanilgan",
  revoked: "Bekor qilingan",
  all: "Barchasi",
  text: "Matn",
  video: "Video",
  image: "Rasm",
};

export function statusLabel(value: string): string {
  return labels[value] ?? "Noma’lum holat";
}

/** Translate the original seeded copy even when an existing database still has it. */
const eventLabels: Record<string, string> = {
  "CLASS OF 2026": "2026-YIL BITIRUVCHILARI",
  "Class of 2026": "2026-yil bitiruvchilari",
  "School Central Courtyard": "Maktabning markaziy hovlisi",
  "A private graduation evening for two 11th-grade classes.": "Ikkita 11-sinf uchun bitiruv oqshomi.",
  "A private graduation evening for two 11th-grade classes. One last night together.": "Ikkita 11-sinf uchun bitiruv oqshomi. Yana bir unutilmas kecha birga.",
  Welcome: "Kutib olish",
  "Memories & Videos": "Xotiralar va videolar",
  Movie: "Film",
  "Stories & Speeches": "Hikoyalar va tilaklar",
  "Final Moments": "Yakuniy lahzalar",
  End: "Yakun",
};

export function eventLabel(value: string): string {
  return eventLabels[value] ?? value;
}
