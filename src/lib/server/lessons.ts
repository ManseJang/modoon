import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { deleteStorageObject } from "@/lib/server/storage";
import type { AdminLesson, Lesson, LessonFormInput } from "@/types/lesson";

const LESSONS_COLLECTION = "lessons";

function toLesson(id: string, data: FirebaseFirestore.DocumentData): Lesson {
  return {
    id,
    title: data.title,
    teacher: data.teacher,
    objective: data.objective,
    concern: data.concern,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    location: data.location,
    applicationStartAt: data.applicationStartAt,
    applicationEndAt: data.applicationEndAt,
    capacity: data.capacity,
    applicantCount: data.applicantCount,
    pdfUrl: data.pdfUrl ?? null,
    pdfStoragePath: data.pdfStoragePath ?? null,
    isPublished: data.isPublished,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export function toAdminLesson(lesson: Lesson): AdminLesson {
  return {
    ...lesson,
    applicationStartAt: lesson.applicationStartAt.toDate().toISOString(),
    applicationEndAt: lesson.applicationEndAt.toDate().toISOString(),
    createdAt: lesson.createdAt.toDate().toISOString(),
    updatedAt: lesson.updatedAt.toDate().toISOString(),
  };
}

export async function listAllLessonsAdmin(): Promise<Lesson[]> {
  const db = getAdminDb();
  const snap = await db.collection(LESSONS_COLLECTION).orderBy("date", "desc").get();
  return snap.docs.map((doc) => toLesson(doc.id, doc.data()));
}

export async function getLessonAdmin(id: string): Promise<Lesson | null> {
  const db = getAdminDb();
  const snap = await db.collection(LESSONS_COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return toLesson(snap.id, snap.data()!);
}

function inputToFirestoreFields(input: LessonFormInput) {
  return {
    title: input.title,
    teacher: input.teacher,
    objective: input.objective,
    concern: input.concern,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    location: input.location,
    applicationStartAt: Timestamp.fromDate(new Date(`${input.applicationStartAt}:00+09:00`)),
    applicationEndAt: Timestamp.fromDate(new Date(`${input.applicationEndAt}:00+09:00`)),
    capacity: input.capacity,
    isPublished: input.isPublished,
  };
}

export async function createLesson(input: LessonFormInput): Promise<string> {
  const db = getAdminDb();
  const ref = await db.collection(LESSONS_COLLECTION).add({
    ...inputToFirestoreFields(input),
    applicantCount: 0,
    pdfUrl: null,
    pdfStoragePath: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateLesson(id: string, input: LessonFormInput): Promise<void> {
  const db = getAdminDb();
  await db
    .collection(LESSONS_COLLECTION)
    .doc(id)
    .update({
      ...inputToFirestoreFields(input),
      updatedAt: FieldValue.serverTimestamp(),
    });
}

/** 수업을 삭제합니다. 연결된 지도안 PDF와 신청 내역도 함께 정리합니다. */
export async function deleteLesson(id: string): Promise<void> {
  const db = getAdminDb();
  const lessonRef = db.collection(LESSONS_COLLECTION).doc(id);
  const lessonSnap = await lessonRef.get();
  if (!lessonSnap.exists) return;

  const pdfStoragePath = lessonSnap.data()?.pdfStoragePath as string | null | undefined;
  if (pdfStoragePath) {
    await deleteStorageObject(pdfStoragePath);
  }

  const applicationsSnap = await db.collection("applications").where("lessonId", "==", id).get();
  const batch = db.batch();
  applicationsSnap.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(lessonRef);
  await batch.commit();
}

export async function setLessonPdf(
  id: string,
  fields: { pdfUrl: string; pdfStoragePath: string }
): Promise<void> {
  const db = getAdminDb();
  await db.collection(LESSONS_COLLECTION).doc(id).update({
    pdfUrl: fields.pdfUrl,
    pdfStoragePath: fields.pdfStoragePath,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function clearLessonPdf(id: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(LESSONS_COLLECTION).doc(id).update({
    pdfUrl: null,
    pdfStoragePath: null,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function duplicateLesson(id: string): Promise<string> {
  const db = getAdminDb();
  const snap = await db.collection(LESSONS_COLLECTION).doc(id).get();
  if (!snap.exists) throw new Error("원본 수업을 찾을 수 없습니다.");
  const data = snap.data()!;

  const ref = await db.collection(LESSONS_COLLECTION).add({
    title: `${data.title} (복사본)`,
    teacher: data.teacher,
    objective: data.objective,
    concern: data.concern,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    location: data.location,
    applicationStartAt: data.applicationStartAt,
    applicationEndAt: data.applicationEndAt,
    capacity: data.capacity,
    applicantCount: 0,
    pdfUrl: null,
    pdfStoragePath: null,
    isPublished: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}
