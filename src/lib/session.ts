import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { serverEnv } from "@/lib/env";

export const SESSION_COOKIE = "lc_session";
const SESSION_DAYS = 45; // comfortably covers registration -> event night
const ISSUER = "last-chapter";
const AUDIENCE = "student";

function key() {
  return new TextEncoder().encode(serverEnv.sessionSecret);
}

/** Signed, httpOnly cookie. The token only carries the student id; everything else is looked up. */
export async function createStudentSession(studentId: string): Promise<void> {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(studentId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key());

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

/** Returns the student id from a valid session cookie, or null. */
export async function readStudentSessionId(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null; // expired, tampered, or signed with an old secret
  }
}

export async function destroyStudentSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
