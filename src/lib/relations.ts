/** Supabase to-one relations are objects; also accept the array shape of older queries. */
export function firstRelated<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}
