"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Spinner from "@/components/ui/Spinner";
import type { AdminLesson, LessonFormInput } from "@/types/lesson";
import { toDateTimeLocalValue } from "@/lib/utils/date";

export interface LessonFormResult {
  success: boolean;
  error?: string;
}

const PERIOD_PRESETS = [
  { label: "1교시", start: "09:00", end: "09:40" },
  { label: "2교시", start: "09:50", end: "10:30" },
  { label: "3교시", start: "10:40", end: "11:20" },
  { label: "4교시", start: "11:30", end: "12:10" },
  { label: "5교시", start: "13:10", end: "13:50" },
  { label: "6교시", start: "14:00", end: "14:40" },
];

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
      applicationStartAt: toDateTimeLocalValue(new Date()),
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

/** 수업 날짜 하루 전 18:00을 datetime-local 문자열("YYYY-MM-DDTHH:mm")로 반환합니다. */
function defaultApplicationEndAt(dateStr: string): string {
  // UTC 기준 계산으로 날짜 연산을 하되, 실제로는 순수한 달력 날짜 뺄셈이라 타임존 영향이 없습니다.
  const [y, m, d] = dateStr.split("-").map(Number);
  const dayBefore = new Date(Date.UTC(y, m - 1, d - 1));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dayBefore.getUTCFullYear()}-${pad(dayBefore.getUTCMonth() + 1)}-${pad(dayBefore.getUTCDate())}T18:00`;
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
  const [endAtTouched, setEndAtTouched] = useState(Boolean(initialLesson));

  function update<K extends keyof LessonFormInput>(key: K, value: LessonFormInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleDateChange(value: string) {
    setForm((prev) => ({
      ...prev,
      date: value,
      applicationEndAt: !endAtTouched && value ? defaultApplicationEndAt(value) : prev.applicationEndAt,
    }));
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
      <p className="rounded-xl bg-primary-light/40 px-4 py-2.5 text-xs text-primary-dark">
        수업 주제·교사·장소·날짜·교시만 입력해도 바로 등록할 수 있어요. 신청 기간과 나머지 항목은 자동으로
        채워지며, 필요하면 언제든 수정할 수 있습니다.
      </p>

      <Field label="수업 주제">
        <input
          required
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="예: 함께 해결하는 우리 동네 환경 문제"
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="수업 날짜">
          <input
            required
            type="date"
            value={form.date}
            onChange={(e) => handleDateChange(e.target.value)}
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

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-muted">교시 빠른 선택</p>
        <div className="flex flex-wrap gap-1.5">
          {PERIOD_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, startTime: p.start, endTime: p.end }))}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                form.startTime === p.start && form.endTime === p.end
                  ? "border-primary bg-primary-light text-primary-dark"
                  : "border-border text-foreground/70 hover:bg-foreground/5"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <details className="rounded-xl border border-border">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-foreground/80">
          수업 목표 · 수업 고민 (선택)
        </summary>
        <div className="flex flex-col gap-4 border-t border-border p-4">
          <Field label="수업 목표 (선택)">
            <textarea
              rows={2}
              value={form.objective}
              onChange={(e) => update("objective", e.target.value)}
              placeholder="이 수업을 통해 학생들이 무엇을 배우게 되나요?"
              className={inputClass}
            />
          </Field>
          <Field label="수업 고민 (선택)">
            <textarea
              rows={2}
              value={form.concern}
              onChange={(e) => update("concern", e.target.value)}
              placeholder="수업을 준비하며 고민한 지점을 자유롭게 적어주세요."
              className={inputClass}
            />
          </Field>
        </div>
      </details>

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
            onChange={(e) => {
              setEndAtTouched(true);
              update("applicationEndAt", e.target.value);
            }}
            className={inputClass}
          />
        </Field>
      </div>
      {!endAtTouched && (
        <p className="-mt-3 text-xs text-muted">
          신청 마감 일시는 수업 날짜 전날 18:00으로 자동 설정됩니다. 직접 입력하면 그 값을 사용해요.
        </p>
      )}

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
