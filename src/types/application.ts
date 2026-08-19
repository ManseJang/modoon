import { Timestamp } from "firebase/firestore";

export type ApplicationStatus = "confirmed" | "cancelled";

/**
 * applications 컬렉션 문서 구조
 */
export interface Application {
  id: string;
  lessonId: string;
  name: string;
  organization: string;
  phone: string; // "010-1234-5678"
  phoneLast4: string; // 신청 확인용 뒤 4자리
  privacyConsent: boolean;
  photoConsent: boolean;
  status: ApplicationStatus;
  createdAt: Timestamp;
}

/** 관리자 API 응답용: Timestamp 대신 ISO 문자열을 사용합니다. */
export interface AdminApplication extends Omit<Application, "createdAt"> {
  createdAt: string;
}

/** 관리자 전체 신청자 목록용: 수업 정보가 함께 포함됩니다. */
export interface AdminApplicantWithLesson extends AdminApplication {
  lessonTitle: string;
  lessonDate: string;
  lessonTeacher: string;
}

export interface ApplicationFormInput {
  name: string;
  organization: string;
  phone: string;
  privacyConsent: boolean;
  photoConsent: boolean;
}
