"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Lesson } from "@/types/lesson";
import { getLessonStatus } from "@/lib/utils/status";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const DOT_COLOR: Record<string, string> = {
  upcoming: "bg-muted",
  open: "bg-accent",
  "closing-soon": "bg-warning",
  closed: "bg-danger",
  ended: "bg-foreground/25",
};

export default function LessonCalendar({
  lessons,
  onSelectLesson,
}: {
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
}) {
  const [month, setMonth] = useState(() => new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const lessonsByDate = useMemo(() => {
    const map = new Map<string, Lesson[]>();
    for (const lesson of lessons) {
      const list = map.get(lesson.date) ?? [];
      list.push(lesson);
      map.set(lesson.date, list);
    }
    return map;
  }, [lessons]);

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{format(month, "yyyy년 M월")}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="이전 달"
            onClick={() => setMonth((prev) => subMonths(prev, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-primary-light hover:text-primary-dark"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setMonth(new Date())}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted hover:bg-primary-light hover:text-primary-dark"
          >
            오늘
          </button>
          <button
            type="button"
            aria-label="다음 달"
            onClick={() => setMonth((prev) => addMonths(prev, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-primary-light hover:text-primary-dark"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted sm:gap-2">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayLessons = lessonsByDate.get(dateKey) ?? [];
          const inMonth = isSameMonth(day, month);
          const today = isToday(day);

          return (
            <div
              key={dateKey}
              className={`flex min-h-20 flex-col gap-1 rounded-xl border p-1.5 sm:min-h-28 sm:p-2 ${
                inMonth ? "border-border" : "border-transparent"
              } ${today ? "bg-primary-light/50" : ""}`}
            >
              <span
                className={`text-xs font-semibold ${
                  inMonth ? (today ? "text-primary-dark" : "text-foreground/70") : "text-foreground/20"
                }`}
              >
                {format(day, "d")}
              </span>

              <div className="flex flex-col gap-0.5">
                {dayLessons.slice(0, 2).map((lesson) => {
                  const status = getLessonStatus(lesson);
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => onSelectLesson(lesson)}
                      className="flex items-center gap-1 truncate rounded-md px-1 py-0.5 text-left text-[10px] font-medium text-foreground/80 hover:bg-primary-light sm:text-xs"
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_COLOR[status]}`} />
                      <span className="truncate">{lesson.title}</span>
                    </button>
                  );
                })}
                {dayLessons.length > 2 && (
                  <span className="px-1 text-[10px] font-semibold text-muted">
                    +{dayLessons.length - 2}개 더
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
