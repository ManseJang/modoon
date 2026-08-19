import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/server/auth";
import { cancelApplication } from "@/lib/server/applications";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; appId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });

  const { id, appId } = await params;
  const result = await cancelApplication(id, appId);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
