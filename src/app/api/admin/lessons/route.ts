import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/server/auth";
import { createLesson, listAllLessonsAdmin, toAdminLesson } from "@/lib/server/lessons";
import { validateLessonInput } from "@/lib/server/validate-lesson";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });

  const lessons = await listAllLessonsAdmin();
  return NextResponse.json({ lessons: lessons.map(toAdminLesson) });
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

  const result = validateLessonInput(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const id = await createLesson(result.data);
  return NextResponse.json({ id }, { status: 201 });
}
