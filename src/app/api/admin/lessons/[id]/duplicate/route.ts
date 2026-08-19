import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/server/auth";
import { duplicateLesson } from "@/lib/server/lessons";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });

  const { id } = await params;
  try {
    const newId = await duplicateLesson(id);
    return NextResponse.json({ id: newId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "복제 중 오류가 발생했습니다." }, { status: 400 });
  }
}
