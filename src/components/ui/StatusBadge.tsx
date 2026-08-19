import type { LessonStatus } from "@/types/lesson";
import { LESSON_STATUS_LABEL } from "@/lib/utils/status";

const STATUS_STYLE: Record<LessonStatus, string> = {
  upcoming: "bg-muted/10 text-muted",
  open: "bg-accent-light text-accent",
  "closing-soon": "bg-warning-light text-warning",
  closed: "bg-danger-light text-danger",
  ended: "bg-foreground/5 text-foreground/50",
};

export default function StatusBadge({ status }: { status: LessonStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[status]}`}
    >
      {LESSON_STATUS_LABEL[status]}
    </span>
  );
}
