"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Spinner from "@/components/ui/Spinner";
import type { AdminLesson, LessonFormInput } from "@/types/lesson";
import { toDateTimeLocalValue } from "@/lib/utils/date";

export interface LessonFormResult {
  success: boolean;
  error?: string;
}

function buildInitialState(lesson?: AdminLesson): LessonFormInput {
  if (!lesson) {
    return {
      title: "",
      teacher: "",
      objective: "",
      concern: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      applicationStartAt: "",
      applicationEndAt: "",
      capacity: 15,
      isPublished: false,
    };
  }
  return {
    title: lesson.title,
    teacher: lesson.teacher,
    objective: lesson.objective,
    concern: lesson.concern,
    date: lesson.date,
    startTime: lesson.startTime,
    endTime: lesson.endTime,
    location: lesson.location,
    applicationStartAt: toDateTimeLocalValue(new Date(lesson.applicationStartAt)),
    applicationEndAt: toDateTimeLocalValue(new Date(lesson.applicationEndAt)),
    capacity: lesson.capacity,
    isPublished: lesson.isPublished,
  };
}

export default function LessonForm({
  initialLesson,
  onSubmit,
  submitLabel = "저장",
}: {
  initialLesson?: AdminLesson;
  onSubmit: (input: LessonFormInput) => Promise<LessonFormResult>;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<LessonFormInput>(() => buildInitialState(initialLesson));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof LessonFormInput>(key: K, value: LessonFormInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      const result = await onSubmit(form);
      if (!result.success) {
        setError(result.error ?? "저장 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="수업 주제">
        <input
          required
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="담당 교사">
          <input
            required
            type="text"
            value={form.teacher}
            onChange={(e) => update("teacher", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="수업 장소">
          <input
            required
            type="text"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="예: 4학년 1반"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="수업 목표">
        <textarea
          required
          rows={2}
          value={form.objective}
          onChange={(e) => update("objective", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="수업 고민">
        <textarea
          required
          rows={2}
          value={form.concern}
          onChange={(e) => update("concern", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="수업 날짜">
          <input
            required
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="시작 시간">
          <input
            required
            type="time"
            value={form.startTime}
            onChange={(e) => update("startTime", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="종료 시간">
          <input
            required
            type="time"
            value={form.endTime}
            onChange={(e) => update("endTime", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="신청 시작 일시">
          <input
            required
            type="datetime-local"
            value={form.applicationStartAt}
            onChange={(e) => update("applicationStartAt", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="신청 마감 일시">
          <input
            required
            type="datetime-local"
            value={form.applicationEndAt}
            onChange={(e) => update("applicationEndAt", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="최대 신청 인원">
          <input
            required
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) => update("capacity", Number(e.target.value))}
            className={inputClass}
          />
        </Field>

        <div className="flex flex-col justify-end pb-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-foreground">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => update("isPublished", e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            수업 공개 (체크 해제 시 사용자 화면에 노출되지 않음)
          </label>
        </div>
      </div>

      {error && <p className="rounded-xl bg-danger-light px-4 py-3 text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-70"
      >
        {isSubmitting && <Spinner className="h-4 w-4" />}
        {submitLabel}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      {children}
    </div>
  );
}
