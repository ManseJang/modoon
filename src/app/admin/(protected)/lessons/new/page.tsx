"use client";

import { useRouter } from "next/navigation";
import LessonForm, { type LessonFormResult } from "@/components/admin/LessonForm";
import type { LessonFormInput } from "@/types/lesson";

export default function NewLessonPage() {
  const router = useRouter();

  async function handleSubmit(input: LessonFormInput): Promise<LessonFormResult> {
    const res = await fetch("/api/admin/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error ?? "저장 중 오류가 발생했습니다." };
    router.push(`/admin/lessons/${data.id}`);
    return { success: true };
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-xl font-black text-foreground">새 수업 등록</h1>
      <LessonForm onSubmit={handleSubmit} submitLabel="수업 등록" />
    </div>
  );
}
