"use client";

import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import type { Lesson } from "@/types/lesson";
import { formatLessonDate, formatLessonTime } from "@/lib/utils/date";
import { getLessonStatus } from "@/lib/utils/status";
import StatusBadge from "@/components/ui/StatusBadge";

export default function LessonCard({
  lesson,
  onClick,
}: {
  lesson: Lesson;
  onClick: () => void;
}) {
  const status = getLessonStatus(lesson);
  const ratio = Math.min(lesson.applicantCount / lesson.capacity, 1);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-surface p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg focus-visible:outline-2 focus-visible:outline-primary"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold leading-snug text-foreground">{lesson.title}</h3>
        <StatusBadge status={status} />
      </div>

      <p className="text-sm font-medium text-primary-dark">{lesson.teacher} 선생님</p>

      <div className="flex flex-col gap-1.5 text-sm text-muted">
        <span className="flex items-center gap-1.5">
          <CalendarDays size={15} className="shrink-0" />
          {formatLessonDate(lesson.date)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={15} className="shrink-0" />
          {formatLessonTime(lesson.startTime, lesson.endTime)}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin size={15} className="shrink-0" />
          {lesson.location}
        </span>
      </div>

      <div className="mt-1 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/8">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-muted">
          <Users size={13} />
          {lesson.applicantCount} / {lesson.capacity}명
        </span>
      </div>
    </button>
  );
}
