"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";
import type { CheckResultItem } from "@/lib/server/check";
import { formatLessonDate, formatLessonTime } from "@/lib/utils/date";

export default function ApplicationCheck({
  onSearch,
}: {
  onSearch: (name: string, phoneLast4: string) => Promise<CheckResultItem[]>;
}) {
  const [name, setName] = useState("");
  const [phoneLast4, setPhoneLast4] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phoneLast4?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CheckResultItem[] | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = "이름을 입력해 주세요.";
    if (!/^\d{4}$/.test(phoneLast4)) nextErrors.phoneLast4 = "숫자 4자리를 입력해 주세요.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      const found = await onSearch(name.trim(), phoneLast4);
      setResults(found);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-soft sm:flex-row sm:items-end sm:gap-3"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="check-name" className="text-sm font-semibold text-foreground">
            이름
          </label>
          <input
            id="check-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="장세만"
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
          {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="check-phone" className="text-sm font-semibold text-foreground">
            휴대전화번호 뒤 4자리
          </label>
          <input
            id="check-phone"
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={phoneLast4}
            onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="1234"
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
          {errors.phoneLast4 && <p className="text-xs text-danger">{errors.phoneLast4}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-70"
        >
          {isLoading ? <Spinner className="h-4 w-4" /> : <Search size={16} />}
          검색
        </button>
      </form>

      {results !== null &&
        (results.length === 0 ? (
          <EmptyState
            title="입력하신 정보로 확인되는 신청 내역이 없습니다."
            description="이름과 휴대전화번호 뒤 4자리를 다시 확인해 주세요."
          />
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-foreground">
              신청한 수업이 있습니다. ({results.length}건)
            </p>
            {results.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-foreground">{item.lesson.title}</h3>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                      item.status === "confirmed"
                        ? "bg-accent-light text-accent"
                        : "bg-foreground/5 text-foreground/50"
                    }`}
                  >
                    {item.status === "confirmed" ? "신청 완료" : "취소됨"}
                  </span>
                </div>
                <p className="text-sm text-muted">
                  {formatLessonDate(item.lesson.date)} ·{" "}
                  {formatLessonTime(item.lesson.startTime, item.lesson.endTime)}
                </p>
                <p className="text-sm text-muted">
                  {item.lesson.location} · {item.lesson.teacher} 선생님
                </p>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
