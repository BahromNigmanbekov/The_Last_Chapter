import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { serverEnv } from "@/lib/env";

// Separate cookie from the student session, so an admin and a student can even
// be signed in on the same browser without clashing.
export const ADMIN_COOKIE = "lc_admin_session";
const SESSION_HOURS = 12;
const ISSUER = "last-chapter";
const AUDIENCE = "admin";

function key() {
  return new TextEncoder().encode(serverEnv.sessionSecret);
}

export async function createAdminSession(): Promise<void> {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(key());

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function hasAdminSession(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, key(), { algorithms: ["HS256"], issuer: ISSUER, audience: AUDIENCE });
    return true;
  } catch {
    return false;
  }
}

export async function destroyAdminSession(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}
