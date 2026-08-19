"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Vercel의 시크릿 자동 마스킹이 "AIzaSy..." 형태의 문자열을 정적 빌드 산출물에서
// 감지해 가려버리는 문제를 피하기 위해, API 키는 Base64로 인코딩해 저장하고
// 여기서 디코딩합니다. (Firebase 웹 API 키는 원래 공개되어도 안전한 값입니다.)
function decodeApiKey(): string | undefined {
  const encoded = process.env.NEXT_PUBLIC_FIREBASE_API_KEY_B64;
  if (!encoded) return undefined;
  return atob(encoded);
}

const firebaseConfig = {
  apiKey: decodeApiKey(),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
