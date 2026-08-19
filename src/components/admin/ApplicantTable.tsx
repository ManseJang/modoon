"use client";

import { useMemo, useState } from "react";
import { Download, Search, X } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import EmptyState from "@/components/ui/EmptyState";
import type { AdminApplication } from "@/types/application";
import { formatDateTime } from "@/lib/utils/date";

export default function ApplicantTable({
  lessonId,
  lessonTitle,
  capacity,
  applicants,
  onCancel,
}: {
  lessonId: string;
  lessonTitle: string;
  capacity: number;
  applicants: AdminApplication[];
  onCancel: (applicationId: string) => Promise<void>;
}) {
  const [keyword, setKeyword] = useState("");
  const [cancelTarget, setCancelTarget] = useState<AdminApplication | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const activeCount = applicants.filter((a) => a.status === "confirmed").length;

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return applicants;
    return applicants.filter((a) => a.name.toLowerCase().includes(kw) || a.organization.toLowerCase().includes(kw));
  }, [applicants, keyword]);

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await onCancel(cancelTarget.id);
      setCancelTarget(null);
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-foreground">
          신청자 {activeCount} / {capacity}명
        </p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="이름/소속 검색"
              className="rounded-xl border border-border bg-background py-2 pl-8 pr-3 text-xs outline-none focus:border-primary"
            />
          </div>
          <a
            href={`/api/admin/lessons/${lessonId}/applicants/csv`}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-foreground/5"
          >
            <Download size={14} />
            CSV 다운로드
          </a>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="신청자가 없습니다." description="아직 이 수업에 신청한 사람이 없습니다." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-soft">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-muted">
                <th className="px-3 py-2.5">번호</th>
                <th className="px-3 py-2.5">성함</th>
                <th className="px-3 py-2.5">소속</th>
                <th className="px-3 py-2.5">연락처</th>
                <th className="px-3 py-2.5">신청 일시</th>
                <th className="px-3 py-2.5">개인정보</th>
                <th className="px-3 py-2.5">촬영동의</th>
                <th className="px-3 py-2.5">상태</th>
                <th className="px-3 py-2.5 text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2.5 text-muted">{i + 1}</td>
                  <td className="px-3 py-2.5 font-semibold text-foreground">{a.name}</td>
                  <td className="px-3 py-2.5">{a.organization}</td>
                  <td className="px-3 py-2.5">{a.phone}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted">
                    {formatDateTime(new Date(a.createdAt))}
                  </td>
                  <td className="px-3 py-2.5 text-xs">{a.privacyConsent ? "동의" : "미동의"}</td>
                  <td className="px-3 py-2.5 text-xs">{a.photoConsent ? "동의" : "미동의"}</td>
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
        onConfirm={handleConfirmCancel}
        title="신청을 취소할까요?"
        description={`"${cancelTarget?.name}"님의 "${lessonTitle}" 신청을 취소 처리합니다.`}
        confirmLabel="취소 처리"
        isLoading={isCancelling}
        danger
      />
    </div>
  );
}
