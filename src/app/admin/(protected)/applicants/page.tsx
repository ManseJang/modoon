"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Download, Search, X } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmModal from "@/components/ui/ConfirmModal";
import type { AdminApplicantWithLesson } from "@/types/application";
import { formatDateTime, formatLessonDate } from "@/lib/utils/date";

type StatusFilter = "all" | "confirmed" | "cancelled";

export default function AdminApplicantsPage() {
  const [applicants, setApplicants] = useState<AdminApplicantWithLesson[] | null>(null);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [cancelTarget, setCancelTarget] = useState<AdminApplicantWithLesson | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  function loadApplicants() {
    fetch("/api/admin/applicants")
      .then((res) => res.json())
      .then((data) => setApplicants(data.applicants ?? []));
  }

  useEffect(() => {
    loadApplicants();
  }, []);

  const filtered = useMemo(() => {
    if (!applicants) return [];
    const kw = keyword.trim().toLowerCase();
    return applicants.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (
        kw &&
        !`${a.name} ${a.organization} ${a.lessonTitle} ${a.lessonTeacher}`.toLowerCase().includes(kw)
      )
        return false;
      return true;
    });
  }, [applicants, keyword, statusFilter]);

  const activeCount = applicants?.filter((a) => a.status === "confirmed").length ?? 0;

  async function handleCancel() {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/admin/lessons/${cancelTarget.lessonId}/applicants/${cancelTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("신청이 취소 처리되었습니다.");
        setCancelTarget(null);
        loadApplicants();
      } else {
        toast.error("취소 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-black text-foreground">전체 신청자</h1>
        <a
          href="/api/admin/applicants/csv"
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
        >
          <Download size={16} />
          전체 CSV 다운로드
        </a>
      </div>

      <p className="text-sm font-semibold text-foreground">
        전체 신청자 {activeCount}명 {applicants && `(취소 포함 총 ${applicants.length}건)`}
      </p>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="이름, 소속, 수업명, 교사명 검색"
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary sm:w-36"
        >
          <option value="all">전체 상태</option>
          <option value="confirmed">신청 완료</option>
          <option value="cancelled">취소</option>
        </select>
      </div>

      {applicants === null ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="신청자가 없습니다." description="검색어나 필터 조건을 변경해보세요." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-soft">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-muted">
                <th className="px-3 py-2.5">번호</th>
                <th className="px-3 py-2.5">수업명</th>
                <th className="px-3 py-2.5">수업날짜</th>
                <th className="px-3 py-2.5">성함</th>
                <th className="px-3 py-2.5">소속</th>
                <th className="px-3 py-2.5">연락처</th>
                <th className="px-3 py-2.5">신청일시</th>
                <th className="px-3 py-2.5">상태</th>
                <th className="px-3 py-2.5 text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2.5 text-muted">{i + 1}</td>
                  <td className="max-w-[200px] truncate px-3 py-2.5 font-semibold text-foreground">
                    {a.lessonTitle}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted">
                    {a.lessonDate ? formatLessonDate(a.lessonDate) : "-"}
                  </td>
                  <td className="px-3 py-2.5">{a.name}</td>
                  <td className="px-3 py-2.5">{a.organization}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{a.phone}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted">
                    {formatDateTime(new Date(a.createdAt))}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                        a.status === "confirmed" ? "bg-accent-light text-accent" : "bg-foreground/5 text-foreground/50"
                      }`}
                    >
                      {a.status === "confirmed" ? "신청 완료" : "취소"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {a.status === "confirmed" && (
                      <button
                        type="button"
                        onClick={() => setCancelTarget(a)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-danger hover:bg-danger-light"
                      >
                        <X size={13} />
                        취소
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="신청을 취소할까요?"
        description={`"${cancelTarget?.name}"님의 "${cancelTarget?.lessonTitle}" 신청을 취소 처리합니다.`}
        confirmLabel="취소 처리"
        isLoading={isCancelling}
        danger
      />
    </div>
  );
}
