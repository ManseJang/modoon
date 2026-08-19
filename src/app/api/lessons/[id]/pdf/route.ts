import { getLessonAdmin } from "@/lib/server/lessons";
import { readStorageObject } from "@/lib/server/storage";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await getLessonAdmin(id);
  if (!lesson || !lesson.pdfStoragePath) {
    return new Response("파일을 찾을 수 없습니다.", { status: 404 });
  }

  const object = await readStorageObject(lesson.pdfStoragePath);
  if (!object) {
    return new Response("파일을 찾을 수 없습니다.", { status: 404 });
  }

  return new Response(new Uint8Array(object.buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=300",
    },
  });
}
