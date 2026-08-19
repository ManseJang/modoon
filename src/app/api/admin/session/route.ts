import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { ADMIN_SESSION_COOKIE, SESSION_EXPIRES_IN_MS, getAdminSession } from "@/lib/server/auth";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  const idToken = typeof body === "object" && body !== null ? (body as Record<string, unknown>).idToken : null;
  if (typeof idToken !== "string" || !idToken) {
    return NextResponse.json({ success: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    if (!decoded.email || decoded.email !== process.env.ADMIN_ALLOWED_EMAIL) {
      return NextResponse.json({ success: false, error: "관리자 권한이 없습니다." }, { status: 403 });
    }

    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN_MS,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
    });
    return response;
  } catch {
    return NextResponse.json({ success: false, error: "로그인 처리 중 오류가 발생했습니다." }, { status: 401 });
  }
}

export async function DELETE() {
  const session = await getAdminSession();
  if (session) {
    try {
      await getAdminAuth().revokeRefreshTokens(session.uid);
    } catch {
      // 무시: 로그아웃은 쿠키 삭제만으로도 충분히 처리됨
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
