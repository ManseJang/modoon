"use client";

import { Search } from "lucide-react";
import type { LessonStatus } from "@/types/lesson";
import { LESSON_STATUS_LABEL } from "@/lib/utils/status";

export interface LessonFilterState {
  keyword: string;
  date: string; // "YYYY-MM-DD" or ""
  status: LessonStatus | "all";
  onlyAvailable: boolean;
}

export const DEFAULT_LESSON_FILTER: LessonFilterState = {
  keyword: "",
  date: "",
  status: "all",
  onlyAvailable: false,
};

export default function LessonFilters({
  value,
  onChange,
}: {
  value: LessonFilterState;
  onChange: (next: LessonFilterState) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:min-w-[220px]">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={value.keyword}
          onChange={(e) => onChange({ ...value, keyword: e.target.value })}
          placeholder="수업명 또는 교사명 검색"
          className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-muted focus:border-primary"
        />
      </div>

      <input
        type="date"
        value={value.date}
        onChange={(e) => onChange({ ...value, date: e.target.value })}
        aria-label="날짜 필터"
        className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary sm:w-44"
      />

      <select
        value={value.status}
        onChange={(e) => onChange({ ...value, status: e.target.value as LessonStatus | "all" })}
        aria-label="상태 필터"
        className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary sm:w-36"
      >
        <option value="all">전체 상태</option>
        {(Object.keys(LESSON_STATUS_LABEL) as LessonStatus[]).map((status) => (
          <option key={status} value={status}>
            {LESSON_STATUS_LABEL[status]}
          </option>
        ))}
      </select>

      <label className="flex cursor-pointer items-center gap-2 rounded-xl px-1 py-1.5 text-sm font-medium text-foreground/80">
        <input
          type="checkbox"
          checked={value.onlyAvailable}
          onChange={(e) => onChange({ ...value, onlyAvailable: e.target.checked })}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        신청 가능한 수업만
      </label>
    </div>
  );
}
