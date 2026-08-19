import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/server/auth";
import { listAllApplicantsAdmin } from "@/lib/server/applications";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });

  const applicants = await listAllApplicantsAdmin();
  return NextResponse.json({
    applicants: applicants.map((a) => ({ ...a, createdAt: a.createdAt.toDate().toISOString() })),
  });
}
