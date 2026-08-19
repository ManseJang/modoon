import "server-only";

import type { LessonFormInput } from "@/types/lesson";

export function validateLessonInput(body: unknown): { data: LessonFormInput } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "잘못된 요청입니다." };
  }
  const b = body as Record<string, unknown>;

  const requiredStrings: (keyof LessonFormInput)[] = [
    "title",
    "teacher",
    "date",
    "startTime",
    "endTime",
    "location",
    "applicationStartAt",
    "applicationEndAt",
  ];

  for (const key of requiredStrings) {
    if (typeof b[key] !== "string" || !(b[key] as string).trim()) {
      return { error: "모든 필수 항목을 입력해 주세요." };
    }
  }

  // 수업 목표/고민은 선택 입력 항목입니다.
  if (typeof b.objective !== "string" || typeof b.concern !== "string") {
    return { error: "잘못된 요청입니다." };
  }

  const types = Array.isArray(b.types) ? b.types.filter((t): t is string => typeof t === "string") : [];

  if (typeof b.capacity !== "number" || !Number.isInteger(b.capacity) || b.capacity < 1) {
    return { error: "최대 신청 인원은 1명 이상의 정수여야 합니다." };
  }

  if (typeof b.isPublished !== "boolean") {
    return { error: "공개 여부를 확인해 주세요." };
  }

  const applicationStartAt = new Date(`${b.applicationStartAt}:00+09:00`);
  const applicationEndAt = new Date(`${b.applicationEndAt}:00+09:00`);
  if (Number.isNaN(applicationStartAt.getTime()) || Number.isNaN(applicationEndAt.getTime())) {
    return { error: "신청 기간 날짜/시간 형식이 올바르지 않습니다." };
  }
  if (applicationStartAt.getTime() >= applicationEndAt.getTime()) {
    return { error: "신청 마감일시는 신청 시작일시보다 이후여야 합니다." };
  }

  return {
    data: {
      title: (b.title as string).trim(),
      teacher: (b.teacher as string).trim(),
      objective: (b.objective as string).trim(),
      concern: (b.concern as string).trim(),
      date: b.date as string,
      startTime: b.startTime as string,
      endTime: b.endTime as string,
      location: (b.location as string).trim(),
      types,
      applicationStartAt: b.applicationStartAt as string,
      applicationEndAt: b.applicationEndAt as string,
      capacity: b.capacity as number,
      isPublished: b.isPublished as boolean,
    },
  };
}
