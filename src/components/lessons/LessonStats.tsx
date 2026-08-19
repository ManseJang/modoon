import { BookOpen, CheckCircle2, Lock, Users } from "lucide-react";
import type { Lesson } from "@/types/lesson";
import { getLessonStatus } from "@/lib/utils/status";

export default function LessonStats({ lessons }: { lessons: Lesson[] }) {
  const total = lessons.length;
  const open = lessons.filter((l) => {
    const s = getLessonStatus(l);
    return s === "open" || s === "closing-soon";
  }).length;
  const closed = lessons.filter((l) => getLessonStatus(l) === "closed").length;
  const totalApplicants = lessons.reduce((sum, l) => sum + l.applicantCount, 0);

  const items = [
    { label: "전체 공개수업", value: total, icon: BookOpen },
    { label: "신청 중인 수업", value: open, icon: CheckCircle2 },
    { label: "신청 마감 수업", value: closed, icon: Lock },
    { label: "전체 신청 인원", value: totalApplicants, icon: Users },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {items.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 shadow-soft sm:p-5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
            <Icon size={18} />
          </div>
          <p className="text-2xl font-black text-foreground sm:text-3xl">{value}</p>
          <p className="text-xs font-medium text-muted sm:text-sm">{label}</p>
        </div>
      ))}
    </div>
  );
}
