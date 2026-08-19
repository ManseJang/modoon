"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { Copy, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmModal from "@/components/ui/ConfirmModal";
import type { AdminLesson, LessonStatus } from "@/types/lesson";
import { formatDateTime, formatLessonDate, formatLessonTime } from "@/lib/utils/date";
import { getAdminLessonStatus, LESSON_STATUS_LABEL } from "@/lib/utils/status";

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<AdminLesson[] | null>(null);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<LessonStatus | "all">("all");
  const [deleteTarget, setDeleteTarget] = useState<AdminLesson | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function loadLessons() {
    fetch("/api/admin/lessons")
      .then((res) => res.json())
      .then((data) => setLessons(data.lessons ?? []));
  }

  useEffect(() => {
    loadLessons();
  }, []);

  const filtered = useMemo(() => {
    if (!lessons) return [];
    const kw = keyword.trim().toLowerCase();
    return lessons.filter((lesson) => {
      if (kw && !`${lesson.title} ${lesson.teacher}`.toLowerCase().includes(kw)) return false;
      if (statusFilter !== "all" && getAdminLessonStatus(lesson) !== statusFilter) return false;
      return true;
    });
  }, [lessons, keyword, statusFilter]);

  async function handleDuplicate(lesson: AdminLesson) {
    const res = await fetch(`/api/admin/lessons/${lesson.id}/duplicate`, { method: "POST" });
    if (res.ok) {
      toast.success("수업이 복제되었습니다.");
      loadLessons();
    } else {
      toast.error("복제 중 오류가 발생했습니다.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/lessons/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("수업이 삭제되었습니다.");
        setDeleteTarget(null);
        loadLessons();
      } else {
        toast.error("삭제 중 오류가 발생했습니다.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-black text-foreground">수업 관리</h1>
        <Link
          href="/admin/lessons/new"
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
        >
          <Plus size={16} />
          새 수업 등록
        </Link>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="수업명 또는 교사명 검색"
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LessonStatus | "all")}
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary sm:w-36"
        >
          <option value="all">전체 상태</option>
          {(Object.keys(LESSON_STATUS_LABEL) as LessonStatus[]).map((s) => (
            <option key={s} value={s}>
              {LESSON_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      {lessons === null ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="등록된 수업이 없습니다." description="새 수업을 등록해보세요." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-soft">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-muted">
                <th className="px-4 py-3">날짜</th>
                <th className="px-4 py-3">수업명</th>
                <th className="px-4 py-3">교사</th>
                <th className="px-4 py-3">장소</th>
                <th className="px-4 py-3">신청 기간</th>
                <th className="px-4 py-3">신청 인원</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lesson) => (
                <tr key={lesson.id} className="border-b border-border last:border-0 hover:bg-primary-light/20">
                  <td className="whitespace-nowrap px-4 py-3">{formatLessonDate(lesson.date)}</td>
                  <td className="max-w-[220px] px-4 py-3">
                    <p className="truncate font-semibold text-foreground">{lesson.title}</p>
                    <p className="text-xs text-muted">{formatLessonTime(lesson.startTime, lesson.endTime)}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{lesson.teacher}</td>
                  <td className="whitespace-nowrap px-4 py-3">{lesson.location}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                    {formatDateTime(new Date(lesson.applicationStartAt))}
                    <br />~ {formatDateTime(new Date(lesson.applicationEndAt))}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {lesson.applicantCount} / {lesson.capacity}명
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge status={getAdminLessonStatus(lesson)} />
                    {!lesson.isPublished && (
                      <span className="ml-1 inline-flex items-center rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-bold text-foreground/50">
                        비공개
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconLink href={`/admin/lessons/${lesson.id}?tab=applicants`} label="신청자">
                        <Users size={15} />
                      </IconLink>
                      <IconLink href={`/admin/lessons/${lesson.id}`} label="수정">
                        <Pencil size={15} />
                      </IconLink>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(lesson)}
                        aria-label="복제"
                        title="복제"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-foreground/5"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(lesson)}
                        aria-label="삭제"
                        title="삭제"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-danger hover:bg-danger-light"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="수업을 삭제할까요?"
        description={`"${deleteTarget?.title}" 수업과 신청 내역이 모두 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        isLoading={isDeleting}
        danger
      />
    </div>
  );
}

function IconLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-foreground/5"
    >
      {children}
    </Link>
  );
}
