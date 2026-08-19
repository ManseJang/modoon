import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/server/auth";
import { listApplicantsForLesson } from "@/lib/server/applications";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });

  const { id } = await params;
  const applicants = await listApplicantsForLesson(id);
  return NextResponse.json({
    applicants: applicants.map((a) => ({ ...a, createdAt: a.createdAt.toDate().toISOString() })),
  });
}
