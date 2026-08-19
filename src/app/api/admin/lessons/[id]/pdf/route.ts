import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/server/auth";
import { clearLessonPdf, getLessonAdmin, setLessonPdf } from "@/lib/server/lessons";
import { deleteStorageObject, uploadPdf } from "@/lib/server/storage";

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });

  const { id } = await params;
  const lesson = await getLessonAdmin(id);
  if (!lesson) return NextResponse.json({ error: "수업을 찾을 수 없습니다." }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일을 선택해 주세요." }, { status: 400 });
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "PDF 파일만 업로드할 수 있습니다." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "파일 크기는 20MB 이하여야 합니다." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const storagePath = `lessons/${id}/lesson-plan-${Date.now()}.pdf`;

  await uploadPdf(storagePath, bytes);

  const previousPath = lesson.pdfStoragePath;
  const pdfUrl = `/api/lessons/${id}/pdf`;
  await setLessonPdf(id, { pdfUrl, pdfStoragePath: storagePath });

  if (previousPath) {
    await deleteStorageObject(previousPath);
  }

  return NextResponse.json({ success: true, pdfUrl });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });

  const { id } = await params;
  const lesson = await getLessonAdmin(id);
  if (!lesson) return NextResponse.json({ error: "수업을 찾을 수 없습니다." }, { status: 404 });

  if (lesson.pdfStoragePath) {
    await deleteStorageObject(lesson.pdfStoragePath);
  }
  await clearLessonPdf(id);

  return NextResponse.json({ success: true });
}
