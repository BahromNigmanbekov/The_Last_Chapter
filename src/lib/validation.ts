import { z } from "zod";

/** Cyrillic letters that look identical to Latin ones (people type "11-А" with a Cyrillic А). */
const CYRILLIC_LOOKALIKES: Record<string, string> = { А: "A", В: "B", С: "C", Е: "E" };

const APOSTROPHES = /[\u0027\u2018\u2019\u02B9\u02BB\u02BC\u2032\u0060\u00B4]/g;

/** Case-, spacing- and apostrophe-insensitive form of a name (O'ktam = Oʻktam = oktam). */
export function normalizeName(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(APOSTROPHES, "")
    .replace(/[\s\-–—_.]+/g, " ")
    .trim();
}

/** "11-a", "11 A", "11а" (Cyrillic) all become "11A". */
export function normalizeClass(input: string): string {
  return input
    .normalize("NFKC")
    .toUpperCase()
    .replace(/[АВСЕ]/g, (ch) => CYRILLIC_LOOKALIKES[ch] ?? ch)
    .replace(/[\s\-–—_.]+/g, "");
}

/** "azi 7294" / "azi–7294" -> "AZI-7294". Mirrors the DB trigger in 0001_foundation.sql (which is stricter about dash variants). */
export function normalizeCode(input: string): string {
  return input
    .normalize("NFKC")
    .trim()
    .toUpperCase()
    .replace(/[\u2010-\u2015\u2212\s]+/g, "-");
}

export const registrationSchema = z.object({
  firstName: z.string().trim().min(1, "Ismingizni kiriting.").max(60, "Ism yoki familiya juda uzun."),
  lastName: z.string().trim().min(1, "Familiyangizni kiriting.").max(60, "Ism yoki familiya juda uzun."),
  className: z.string().trim().min(1, "Sinfingizni kiriting, masalan 11-A.").max(10, "Sinfingizni kiriting, masalan 11-A."),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
