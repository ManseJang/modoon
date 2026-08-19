import { getAdminSession } from "@/lib/server/auth";
import { listAllApplicantsAdmin } from "@/lib/server/applications";
import { formatDateTime, formatLessonDate } from "@/lib/utils/date";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return new Response("권한이 없습니다.", { status: 401 });

  const applicants = await listAllApplicantsAdmin();

  const header = ["번호", "수업명", "수업날짜", "담당교사", "성함", "소속", "연락처", "신청일시", "개인정보동의", "촬영동의", "상태"];
  const rows = applicants.map((a, i) => [
    String(i + 1),
    a.lessonTitle,
    a.lessonDate ? formatLessonDate(a.lessonDate) : "",
    a.lessonTeacher,
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

  return new Response(csvWithBom, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="applicants_all.csv"; filename*=UTF-8''${encodeURIComponent(
        "전체_신청자목록.csv"
      )}`,
    },
  });
}
