import { Timestamp } from "firebase/firestore";

/**
 * classes 컬렉션 문서 구조
 * date/startTime/endTime은 화면 표시와 DatePicker/TimePicker 입력용 문자열이고,
 * applicationStartAt/applicationEndAt은 동시성 제어와 상태 계산의 기준이 되므로
 * Firestore Timestamp로 저장합니다.
 */
export interface Lesson {
  id: string;
  title: string;
  teacher: string;
  objective: string;
  concern: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  location: string;
  applicationStartAt: Timestamp;
  applicationEndAt: Timestamp;
  capacity: number;
  applicantCount: number;
  pdfUrl: string | null;
  pdfStoragePath: string | null;
  isPublished: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type LessonStatus =
  | "upcoming" // 신청 예정
  | "open" // 신청 중
  | "closing-soon" // 마감 임박
  | "closed" // 신청 마감
  | "ended"; // 수업 종료

/** 관리자 API 응답용: Timestamp 대신 ISO 문자열을 사용합니다. */
export interface AdminLesson extends Omit<Lesson, "applicationStartAt" | "applicationEndAt" | "createdAt" | "updatedAt"> {
  applicationStartAt: string;
  applicationEndAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonFormInput {
  title: string;
  teacher: string;
  objective: string;
  concern: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  applicationStartAt: string; // "YYYY-MM-DDTHH:mm" (datetime-local)
  applicationEndAt: string; // "YYYY-MM-DDTHH:mm"
  capacity: number;
  isPublished: boolean;
}
