import type { AdminLesson, Lesson, LessonStatus } from "@/types/lesson";

const CLOSING_SOON_RATIO = 0.8;

interface LessonStatusInput {
  date: string;
  startTime: string;
  endTime: string;
  applicationStartAt: { toDate(): Date };
  applicationEndAt: { toDate(): Date };
  applicantCount: number;
  capacity: number;
}

/**
 * 현재 시각을 기준으로 수업 상태를 계산합니다.
 * 우선순위: 수업 종료 > 신청 마감(정원/기간) > 신청 예정 > 신청 중
 */
export function getLessonStatus(lesson: LessonStatusInput, now: Date = new Date()): LessonStatus {
  const lessonEndAt = new Date(`${lesson.date}T${lesson.endTime}:00+09:00`);
  if (now > lessonEndAt) return "ended";

  const applicationStart = lesson.applicationStartAt.toDate();
  const applicationEnd = lesson.applicationEndAt.toDate();
  const isFull = lesson.applicantCount >= lesson.capacity;

  if (now < applicationStart) return "upcoming";
  if (now > applicationEnd || isFull) return "closed";

  if (lesson.applicantCount / lesson.capacity >= CLOSING_SOON_RATIO) return "closing-soon";

  return "open";
}

export const LESSON_STATUS_LABEL: Record<LessonStatus, string> = {
  upcoming: "신청 예정",
  open: "신청 중",
  "closing-soon": "마감 임박",
  closed: "신청 마감",
  ended: "수업 종료",
};

export function canApply(lesson: Lesson, now: Date = new Date()): boolean {
  const status = getLessonStatus(lesson, now);
  return status === "open" || status === "closing-soon";
}

/** 관리자 API 응답(AdminLesson, ISO 문자열)용 상태 계산 */
export function getAdminLessonStatus(lesson: AdminLesson, now: Date = new Date()): LessonStatus {
  return getLessonStatus(
    {
      ...lesson,
      applicationStartAt: { toDate: () => new Date(lesson.applicationStartAt) },
      applicationEndAt: { toDate: () => new Date(lesson.applicationEndAt) },
    },
    now
  );
}
