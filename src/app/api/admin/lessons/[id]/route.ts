import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/server/auth";
import { deleteLesson, getLessonAdmin, toAdminLesson, updateLesson } from "@/lib/server/lessons";
import { validateLessonInput } from "@/lib/server/validate-lesson";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });

  const { id } = await params;
  const lesson = await getLessonAdmin(id);
  if (!lesson) return NextResponse.json({ error: "수업을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ lesson: toAdminLesson(lesson) });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });

  const { id } = await params;
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

  await updateLesson(id, result.data);
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });

  const { id } = await params;
  await deleteLesson(id);
  return NextResponse.json({ success: true });
}
