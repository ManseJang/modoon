"use client";

import { FileText } from "lucide-react";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Lesson } from "@/types/lesson";
import { formatDateTime, formatLessonDate, formatLessonTime } from "@/lib/utils/date";
import { canApply, getLessonStatus } from "@/lib/utils/status";

export default function LessonDetail({
  lesson,
  isOpen,
  onClose,
  onApply,
}: {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}) {
  if (!lesson) return null;

  const status = getLessonStatus(lesson);
  const applyEnabled = canApply(lesson);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="수업 상세정보">
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold leading-snug text-foreground">{lesson.title}</h3>
          <StatusBadge status={status} />
        </div>

        {lesson.types && lesson.types.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lesson.types.map((type) => (
              <span
                key={type}
                className="inline-flex items-center rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-semibold text-accent"
              >
                {type}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-primary-light/40 p-4 text-sm">
          <InfoField label="담당 교사" value={`${lesson.teacher} 선생님`} />
          <InfoField label="수업 장소" value={lesson.location} />
          <InfoField label="수업 일시" value={formatLessonDate(lesson.date)} />
          <InfoField label="수업 시간" value={formatLessonTime(lesson.startTime, lesson.endTime)} />
          <InfoField label="신청 인원" value={`${lesson.applicantCount} / ${lesson.capacity}명`} />
          <InfoField
            label="신청 기간"
            value={`${formatDateTime(lesson.applicationStartAt.toDate())} ~ ${formatDateTime(
              lesson.applicationEndAt.toDate()
            )}`}
            span
          />
        </div>

        <DetailBlock label="수업 목표" text={lesson.objective} />
        <DetailBlock label="수업 고민" text={lesson.concern} />

        {lesson.pdfUrl && (
          <a
            href={lesson.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold text-foreground/80 hover:bg-foreground/5"
          >
            <FileText size={16} />
            지도안 보기
          </a>
        )}

        {applyEnabled && (
          <button
            type="button"
            onClick={onApply}
            className="rounded-xl bg-primary py-4 text-base font-bold text-white transition-colors hover:bg-primary-dark"
          >
            참관 신청하기
          </button>
        )}
        {status === "upcoming" && (
          <p className="rounded-xl bg-foreground/5 py-4 text-center text-sm font-semibold text-muted">
            신청 예정입니다.
          </p>
        )}
        {(status === "closed" || status === "ended") && (
          <p className="rounded-xl bg-foreground/5 py-4 text-center text-sm font-semibold text-muted">
            신청이 마감되었습니다.
          </p>
        )}
      </div>
    </Modal>
  );
}

function InfoField({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={span ? "col-span-2" : undefined}>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  );
}

function DetailBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold text-primary-dark">{label}</p>
      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">{text}</p>
    </div>
  );
}
