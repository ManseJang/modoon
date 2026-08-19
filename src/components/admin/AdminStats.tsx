import { BookOpen, CalendarCheck, CheckCircle2, Lock, Users } from "lucide-react";
import type { AdminLesson } from "@/types/lesson";
import { getAdminLessonStatus } from "@/lib/utils/status";
import { getTodayDateString } from "@/lib/utils/date";

export default function AdminStats({ lessons }: { lessons: AdminLesson[] }) {
  const total = lessons.length;
  const open = lessons.filter((l) => {
    const s = getAdminLessonStatus(l);
    return s === "open" || s === "closing-soon";
  }).length;
  const closed = lessons.filter((l) => {
    const s = getAdminLessonStatus(l);
    return s === "closed" || s === "ended";
  }).length;
  const totalApplicants = lessons.reduce((sum, l) => sum + l.applicantCount, 0);
  const today = getTodayDateString();
  const todayCount = lessons.filter((l) => l.date === today).length;

  const items = [
    { label: "전체 등록 수업", value: total, icon: BookOpen },
    { label: "신청 중인 수업", value: open, icon: CheckCircle2 },
    { label: "마감된 수업", value: closed, icon: Lock },
    { label: "전체 신청자 수", value: totalApplicants, icon: Users },
    { label: "오늘 예정된 수업", value: todayCount, icon: CalendarCheck },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map(({ label, value, icon: Icon }) => (
        <div key={label} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 shadow-soft">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
            <Icon size={18} />
          </div>
          <p className="text-2xl font-black text-foreground">{value}</p>
          <p className="text-xs font-medium text-muted">{label}</p>
        </div>
      ))}
    </div>
  );
}
