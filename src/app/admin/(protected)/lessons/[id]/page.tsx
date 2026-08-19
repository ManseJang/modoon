"use client";

import { use, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import LessonForm, { type LessonFormResult } from "@/components/admin/LessonForm";
import ApplicantTable from "@/components/admin/ApplicantTable";
import PdfUploader from "@/components/admin/PdfUploader";
import Skeleton from "@/components/ui/Skeleton";
import type { AdminLesson, LessonFormInput } from "@/types/lesson";
import type { AdminApplication } from "@/types/application";

function LessonDetailContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"info" | "applicants">(
    searchParams.get("tab") === "applicants" ? "applicants" : "info"
  );
  const [lesson, setLesson] = useState<AdminLesson | null>(null);
  const [applicants, setApplicants] = useState<AdminApplication[] | null>(null);

  useEffect(() => {
    fetch(`/api/admin/lessons/${id}`)
      .then((res) => res.json())
      .then((data) => setLesson(data.lesson ?? null));
  }, [id]);

  function loadApplicants() {
    fetch(`/api/admin/lessons/${id}/applicants`)
      .then((res) => res.json())
      .then((data) => setApplicants(data.applicants ?? []));
  }

  useEffect(() => {
    if (tab === "applicants" && applicants === null) {
      loadApplicants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function handleSubmit(input: LessonFormInput): Promise<LessonFormResult> {
    const res = await fetch(`/api/admin/lessons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error ?? "저장 중 오류가 발생했습니다." };
    toast.success("수업 정보가 저장되었습니다.");
    return { success: true };
  }

  async function handleCancelApplicant(applicationId: string) {
    const res = await fetch(`/api/admin/lessons/${id}/applicants/${applicationId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("신청이 취소 처리되었습니다.");
      loadApplicants();
      fetch(`/api/admin/lessons/${id}`)
        .then((r) => r.json())
        .then((data) => setLesson(data.lesson ?? null));
    } else {
      toast.error("취소 처리 중 오류가 발생했습니다.");
    }
  }

  if (!lesson) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-xl font-black text-foreground">{lesson.title}</h1>

      <div className="flex rounded-full border border-border bg-surface p-1 w-fit">
        <TabButton active={tab === "info"} onClick={() => setTab("info")}>
          수업 정보
        </TabButton>
        <TabButton active={tab === "applicants"} onClick={() => setTab("applicants")}>
          신청자 목록
        </TabButton>
      </div>

      {tab === "info" ? (
        <div className="flex flex-col gap-6">
          <LessonForm initialLesson={lesson} onSubmit={handleSubmit} submitLabel="저장" />
          <PdfUploader
            lessonId={id}
            pdfUrl={lesson.pdfUrl}
            onChange={(pdfUrl) => setLesson((prev) => (prev ? { ...prev, pdfUrl } : prev))}
          />
        </div>
      ) : applicants === null ? (
        <Skeleton className="h-64" />
      ) : (
        <ApplicantTable
          lessonId={id}
          lessonTitle={lesson.title}
          capacity={lesson.capacity}
          applicants={applicants}
          onCancel={handleCancelApplicant}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active ? "bg-primary text-white" : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export default function AdminLessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <LessonDetailContent id={id} />
    </Suspense>
  );
}
