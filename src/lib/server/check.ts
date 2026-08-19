import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";

export interface CheckResultItem {
  id: string;
  status: "confirmed" | "cancelled";
  lesson: {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    teacher: string;
  };
}

/**
 * 이름 + 휴대전화번호 뒤 4자리로 신청 내역을 조회합니다.
 * 개인정보 보호를 위해 서버(Admin SDK)에서만 조회하며, 필요한 최소한의 수업 정보만 반환합니다.
 */
export async function searchApplications(
  name: string,
  phoneLast4: string
): Promise<CheckResultItem[]> {
  const db = getAdminDb();

  const snap = await db
    .collection("applications")
    .where("name", "==", name)
    .where("phoneLast4", "==", phoneLast4)
    .get();

  if (snap.empty) return [];

  const results: CheckResultItem[] = [];
  for (const doc of snap.docs) {
    const app = doc.data();
    const lessonSnap = await db.collection("lessons").doc(app.lessonId).get();
    if (!lessonSnap.exists) continue;
    const lesson = lessonSnap.data()!;

    results.push({
      id: doc.id,
      status: app.status,
      lesson: {
        id: lessonSnap.id,
        title: lesson.title,
        date: lesson.date,
        startTime: lesson.startTime,
        endTime: lesson.endTime,
        location: lesson.location,
        teacher: lesson.teacher,
      },
    });
  }

  return results;
}
