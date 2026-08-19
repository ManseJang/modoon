"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import AdminStats from "@/components/admin/AdminStats";
import StatusBadge from "@/components/ui/StatusBadge";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import type { AdminLesson } from "@/types/lesson";
import { formatLessonDate } from "@/lib/utils/date";
import { getAdminLessonStatus } from "@/lib/utils/status";

export default function AdminDashboardPage() {
  const [lessons, setLessons] = useState<AdminLesson[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/lessons")
      .then((res) => res.json())
      .then((data) => setLessons(data.lessons ?? []));
  }, []);

  const recent = lessons?.slice(0, 5) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-black text-foreground">관리자 대시보드</h1>

      {lessons === null ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <AdminStats lessons={lessons} />
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">최근 등록 수업</h2>
          <Link href="/admin/lessons" className="flex items-center gap-1 text-sm font-semibold text-primary">
            전체 보기 <ArrowRight size={14} />
          </Link>
        </div>

        {lessons === null ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState title="등록된 수업이 없습니다." description="수업 관리에서 새 수업을 등록해보세요." />
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/admin/lessons/${lesson.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-soft hover:bg-primary-light/30"
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-bold text-foreground">{lesson.title}</p>
                  <p className="text-xs text-muted">
                    {formatLessonDate(lesson.date)} · {lesson.teacher} 선생님 · {lesson.applicantCount}/
                    {lesson.capacity}명
                  </p>
                </div>
                <StatusBadge status={getAdminLessonStatus(lesson)} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
