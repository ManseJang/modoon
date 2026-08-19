"use client";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Lesson } from "@/types/lesson";

export const LESSONS_COLLECTION = "lessons";

const lessonConverter: FirestoreDataConverter<Lesson> = {
  toFirestore: (lesson) => lesson,
  fromFirestore: (snapshot: QueryDocumentSnapshot) => {
    const data = snapshot.data();
    return { ...data, id: snapshot.id } as Lesson;
  },
};

function lessonsRef() {
  return collection(db, LESSONS_COLLECTION).withConverter(lessonConverter);
}

/**
 * 공개된(isPublished: true) 수업 목록을 실시간으로 구독합니다.
 * 누군가 신청하면 applicantCount 변경이 바로 반영됩니다.
 */
export function subscribeToPublishedLessons(
  onData: (lessons: Lesson[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(lessonsRef(), where("isPublished", "==", true), orderBy("date", "asc"));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => d.data())),
    (error) => onError?.(error)
  );
}

/** 관리자용: 공개 여부와 무관하게 전체 수업 목록을 실시간으로 구독합니다. */
export function subscribeToAllLessons(
  onData: (lessons: Lesson[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(lessonsRef(), orderBy("date", "desc"));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => d.data())),
    (error) => onError?.(error)
  );
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const snap = await getDoc(doc(db, LESSONS_COLLECTION, id).withConverter(lessonConverter));
  return snap.exists() ? snap.data() : null;
}
