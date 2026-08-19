import type { Lesson } from "@/types/lesson";

function toIcsUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeIcsText(text: string): string {
  return text.replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
}

function buildIcsContent(lesson: Lesson): string {
  const start = new Date(`${lesson.date}T${lesson.startTime}:00+09:00`);
  const end = new Date(`${lesson.date}T${lesson.endTime}:00+09:00`);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//약수초 모두ON//KO",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${lesson.id}@modoon.yaksu`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcsText(lesson.title)}`,
    `LOCATION:${escapeIcsText(lesson.location)}`,
    `DESCRIPTION:${escapeIcsText(`${lesson.teacher} 선생님 공개수업 참관`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** 브라우저에서 수업 일정을 .ics 캘린더 파일로 다운로드합니다. */
export function downloadLessonIcs(lesson: Lesson): void {
  const content = buildIcsContent(lesson);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${lesson.title}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
