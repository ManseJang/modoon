import "server-only";

import { getStorage } from "firebase-admin/storage";
import { getAdminAuth } from "@/lib/firebase/admin";

function getBucket() {
  // getAdminAuth() 호출로 Admin App 초기화를 보장한 뒤 동일 앱의 Storage 버킷을 가져옵니다.
  getAdminAuth();
  return getStorage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
}

export async function deleteStorageObject(storagePath: string): Promise<void> {
  try {
    await getBucket().file(storagePath).delete();
  } catch (error) {
    // 파일이 이미 없는 경우 등은 무시하고 진행합니다.
    console.error("deleteStorageObject failed:", error);
  }
}

export async function uploadPdf(storagePath: string, bytes: Buffer): Promise<void> {
  const file = getBucket().file(storagePath);
  await file.save(bytes, {
    contentType: "application/pdf",
    metadata: { cacheControl: "private, max-age=0" },
  });
}

export async function readStorageObject(
  storagePath: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const file = getBucket().file(storagePath);
  const [exists] = await file.exists();
  if (!exists) return null;

  const [buffer] = await file.download();
  const [metadata] = await file.getMetadata();
  return { buffer, contentType: metadata.contentType ?? "application/pdf" };
}
