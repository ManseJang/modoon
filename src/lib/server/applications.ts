import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { getPhoneLast4 } from "@/lib/utils/validation";
import type { Application } from "@/types/application";

class ApplicationError extends Error {}

export interface SubmitApplicationInput {
  lessonId: string;
  name: string;
  organization: string;
  phone: string;
  privacyConsent: boolean;
  photoConsent: boolean;
}

export type SubmitApplicationResult =
  | { success: true }
  | { success: false; error: string };

/**
 * 참관 신청을 Firestore Transaction으로 안전하게 저장합니다.
 * 신청 기간/정원을 트랜잭션 안에서 다시 확인하므로, 동시에 여러 명이 신청해도
 * capacity를 초과해서 저장되지 않습니다. (Firestore는 트랜잭션 중 대상 문서가
 * 변경되면 자동으로 재시도합니다.)
 */
export async function submitApplication(
  input: SubmitApplicationInput
): Promise<SubmitApplicationResult> {
  const db = getAdminDb();
  const lessonRef = db.collection("lessons").doc(input.lessonId);

  try {
    await db.runTransaction(async (tx) => {
      const lessonSnap = await tx.get(lessonRef);
      if (!lessonSnap.exists) {
        throw new ApplicationError("해당 수업을 찾을 수 없습니다.");
      }

      const lesson = lessonSnap.data() as {
        isPublished: boolean;
        applicationStartAt: Timestamp;
        applicationEndAt: Timestamp;
        capacity: number;
        applicantCount: number;
      };

      if (!lesson.isPublished) {
        throw new ApplicationError("신청할 수 없는 수업입니다.");
      }

      const now = Timestamp.now();
      if (now.toMillis() < lesson.applicationStartAt.toMillis()) {
        throw new ApplicationError("아직 신청 기간이 아닙니다.");
      }
      if (now.toMillis() > lesson.applicationEndAt.toMillis()) {
        throw new ApplicationError("신청 기간이 종료되었습니다.");
      }
      if (lesson.applicantCount >= lesson.capacity) {
        throw new ApplicationError("정원이 마감되어 신청할 수 없습니다.");
      }

      const applicationRef = db.collection("applications").doc();
      tx.set(applicationRef, {
        lessonId: input.lessonId,
        name: input.name,
        organization: input.organization,
        phone: input.phone,
        phoneLast4: getPhoneLast4(input.phone),
        privacyConsent: input.privacyConsent,
        photoConsent: input.photoConsent,
        status: "confirmed",
        createdAt: FieldValue.serverTimestamp(),
      });

      tx.update(lessonRef, {
        applicantCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return { success: true };
  } catch (error) {
    if (error instanceof ApplicationError) {
      return { success: false, error: error.message };
    }
    console.error("submitApplication failed:", error);
    return { success: false, error: "신청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." };
  }
}

/** 관리자용: 특정 수업의 신청자 목록 (최신순) */
export async function listApplicantsForLesson(lessonId: string): Promise<Application[]> {
  const db = getAdminDb();
  const snap = await db.collection("applications").where("lessonId", "==", lessonId).get();

  return snap.docs
    .map((doc) => ({ ...(doc.data() as Omit<Application, "id">), id: doc.id }))
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}

/**
 * 관리자가 신청을 취소 처리합니다. 기록은 삭제하지 않고 status를 'cancelled'로 남겨
 * 감사(audit) 목적의 이력을 보존하며, 정원(applicantCount)은 트랜잭션으로 안전하게 되돌립니다.
 */
export async function cancelApplication(
  lessonId: string,
  applicationId: string
): Promise<{ success: boolean; error?: string }> {
  const db = getAdminDb();
  const lessonRef = db.collection("lessons").doc(lessonId);
  const applicationRef = db.collection("applications").doc(applicationId);

  try {
    await db.runTransaction(async (tx) => {
      const [lessonSnap, applicationSnap] = await Promise.all([tx.get(lessonRef), tx.get(applicationRef)]);
      if (!applicationSnap.exists) {
        throw new ApplicationError("신청 내역을 찾을 수 없습니다.");
      }
      if (applicationSnap.data()?.status === "cancelled") {
        return; // 이미 취소된 경우 중복 처리 방지
      }

      tx.update(applicationRef, { status: "cancelled" });

      if (lessonSnap.exists) {
        const currentCount = (lessonSnap.data()?.applicantCount as number) ?? 0;
        tx.update(lessonRef, {
          applicantCount: Math.max(0, currentCount - 1),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });
    return { success: true };
  } catch (error) {
    if (error instanceof ApplicationError) {
      return { success: false, error: error.message };
    }
    console.error("cancelApplication failed:", error);
    return { success: false, error: "취소 처리 중 오류가 발생했습니다." };
  }
}
