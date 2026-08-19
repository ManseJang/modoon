import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";

const SETTINGS_DOC_PATH = ["settings", "lessonTypes"] as const;

const DEFAULT_LESSON_TYPES = ["질문이 있는 수업", "토의토론 수업", "디지털 수업"];

/** 학생참여중심 수업 유형 목록을 가져옵니다. 문서가 없으면 기본값으로 생성합니다. */
export async function getLessonTypes(): Promise<string[]> {
  const db = getAdminDb();
  const ref = db.collection(SETTINGS_DOC_PATH[0]).doc(SETTINGS_DOC_PATH[1]);
  const snap = await ref.get();

  if (!snap.exists) {
    await ref.set({ types: DEFAULT_LESSON_TYPES });
    return DEFAULT_LESSON_TYPES;
  }

  const types = snap.data()?.types;
  return Array.isArray(types) && types.length > 0 ? types : DEFAULT_LESSON_TYPES;
}

/** 새 수업 유형을 목록에 추가합니다. 이미 있으면 그대로 반환합니다. */
export async function addLessonType(name: string): Promise<string[]> {
  const db = getAdminDb();
  const ref = db.collection(SETTINGS_DOC_PATH[0]).doc(SETTINGS_DOC_PATH[1]);
  const current = await getLessonTypes();

  if (current.includes(name)) return current;

  await ref.set({ types: FieldValue.arrayUnion(name) }, { merge: true });
  return [...current, name];
}
