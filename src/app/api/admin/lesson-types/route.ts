import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/server/auth";
import { addLessonType, getLessonTypes } from "@/lib/server/lesson-types";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });

  const types = await getLessonTypes();
  return NextResponse.json({ types });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const name = typeof body === "object" && body !== null ? (body as Record<string, unknown>).name : null;
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "유형 이름을 입력해 주세요." }, { status: 400 });
  }
  if (name.trim().length > 20) {
    return NextResponse.json({ error: "유형 이름은 20자 이내로 입력해 주세요." }, { status: 400 });
  }

  const types = await addLessonType(name.trim());
  return NextResponse.json({ types });
}
