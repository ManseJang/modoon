import { getAdminSession } from "@/lib/server/auth";
import { listApplicantsForLesson } from "@/lib/server/applications";
import { getLessonAdmin } from "@/lib/server/lessons";
import { formatDateTime } from "@/lib/utils/date";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return new Response("권한이 없습니다.", { status: 401 });

  const { id } = await params;
  const [lesson, applicants] = await Promise.all([getLessonAdmin(id), listApplicantsForLesson(id)]);

  const header = ["번호", "성함", "소속", "연락처", "신청일시", "개인정보동의", "촬영동의", "상태"];
  const rows = applicants.map((a, i) => [
    String(i + 1),
    a.name,
    a.organization,
    a.phone,
    formatDateTime(a.createdAt.toDate()),
    a.privacyConsent ? "동의" : "미동의",
    a.photoConsent ? "동의" : "미동의",
    a.status === "confirmed" ? "신청 완료" : "취소",
  ]);

  const csvContent = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
  const csvWithBom = "﻿" + csvContent;

  const filename = `${lesson?.title ?? "신청자"}_신청자목록.csv`;

  return new Response(csvWithBom, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="applicants.csv"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
