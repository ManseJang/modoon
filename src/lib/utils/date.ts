const WEEKDAY_LABEL = ["일", "월", "화", "수", "목", "금", "토"];
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** UTC 기준 Date를 KST(UTC+9) 벽시계 값으로 변환해 UTC getter로 안전하게 읽을 수 있게 합니다. */
function toKstShifted(date: Date): Date {
  return new Date(date.getTime() + KST_OFFSET_MS);
}

/** "YYYY-MM-DD" -> "2026. 9. 18.(금)" */
export function formatLessonDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${y}. ${m}. ${d}.(${WEEKDAY_LABEL[date.getDay()]})`;
}

/** "HH:mm" ~ "HH:mm" -> "10:40 ~ 11:20" */
export function formatLessonTime(startTime: string, endTime: string): string {
  return `${startTime} ~ ${endTime}`;
}

/** Date -> "YYYY-MM-DDTHH:mm" (KST 기준, datetime-local input value) */
export function toDateTimeLocalValue(date: Date): string {
  const kst = toKstShifted(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${kst.getUTCFullYear()}-${pad(kst.getUTCMonth() + 1)}-${pad(kst.getUTCDate())}T${pad(
    kst.getUTCHours()
  )}:${pad(kst.getUTCMinutes())}`;
}

/** "YYYY-MM-DDTHH:mm" (KST 기준 입력) -> Date */
export function fromDateTimeLocalValue(value: string): Date {
  return new Date(`${value}:00+09:00`);
}

/** Date -> "2026. 8. 24. 09:00" (KST 기준) */
export function formatDateTime(date: Date): string {
  const kst = toKstShifted(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${kst.getUTCFullYear()}. ${kst.getUTCMonth() + 1}. ${kst.getUTCDate()}. ${pad(
    kst.getUTCHours()
  )}:${pad(kst.getUTCMinutes())}`;
}
