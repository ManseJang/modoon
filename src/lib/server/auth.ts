import "server-only";

import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const SESSION_EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000; // 5일

/**
 * 현재 요청의 관리자 세션 쿠키를 검증합니다.
 * 유효하지 않으면 null을 반환합니다. (관리자 여부는 서버 전용 환경변수 ADMIN_ALLOWED_EMAIL로 판단)
 */
export async function getAdminSession(): Promise<{ uid: string; email: string } | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    if (!decoded.email || decoded.email !== process.env.ADMIN_ALLOWED_EMAIL) {
      return null;
    }
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}
