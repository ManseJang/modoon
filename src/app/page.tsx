"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { CalendarDays, LayoutGrid } from "lucide-react";
import LessonStats from "@/components/lessons/LessonStats";
import LessonCalendar from "@/components/lessons/LessonCalendar";
import LessonCard from "@/components/lessons/LessonCard";
import LessonDetail from "@/components/lessons/LessonDetail";
import LessonFilters, {
  DEFAULT_LESSON_FILTER,
  type LessonFilterState,
} from "@/components/lessons/LessonFilters";
import ApplicationForm, { type ApplicationSubmitResult } from "@/components/applications/ApplicationForm";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import type { Lesson } from "@/types/lesson";
import type { ApplicationFormInput } from "@/types/application";
import StatusBadge from "@/components/ui/StatusBadge";
import { subscribeToPublishedLessons } from "@/lib/firebase/lessons";
import { canApply, getLessonStatus } from "@/lib/utils/status";
import { formatLessonTime, getTodayDateString } from "@/lib/utils/date";
import { Sparkles } from "lucide-react";

type ViewMode = "calendar" | "card";

export default function Home() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [filter, setFilter] = useState<LessonFilterState>(DEFAULT_LESSON_FILTER);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToPublishedLessons(
      (data) => {
        setLessons(data);
        setIsLoading(false);
        setLoadError(false);
      },
      () => {
        setIsLoading(false);
        setLoadError(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const publishedLessons = lessons;

  const filteredLessons = useMemo(() => {
    const keyword = filter.keyword.trim().toLowerCase();
    return publishedLessons.filter((lesson) => {
      if (keyword) {
        const haystack = `${lesson.title} ${lesson.teacher}`.toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      if (filter.date && lesson.date !== filter.date) return false;
      if (filter.status !== "all" && getLessonStatus(lesson) !== filter.status) return false;
      if (filter.onlyAvailable && !canApply(lesson)) return false;
      return true;
    });
  }, [publishedLessons, filter]);

  const selectedLesson = lessons.find((l) => l.id === selectedLessonId) ?? null;

  const todayLessons = useMemo(() => {
    const today = getTodayDateString();
    return publishedLessons.filter((l) => l.date === today);
  }, [publishedLessons]);

  function openDetail(lesson: Lesson) {
    setSelectedLessonId(lesson.id);
    setIsDetailOpen(true);
  }

  async function handleApplySubmit(input: ApplicationFormInput): Promise<ApplicationSubmitResult> {
    if (!selectedLesson) {
      return { success: false, error: "수업 정보를 확인할 수 없습니다." };
    }
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: selectedLesson.id, ...input }),
      });
      const data = (await res.json()) as ApplicationSubmitResult;
      if (data.success) toast.success("참관 신청이 완료되었습니다!");
      return data;
    } catch {
      return { success: false, error: "네트워크 오류가 발생했습니다. 다시 시도해 주세요." };
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <section className="flex flex-col gap-2 text-center sm:text-left">
        <p className="text-sm font-bold text-primary">일상수업공개 참관신청</p>
        <h1 className="text-2xl font-black leading-snug text-foreground sm:text-3xl">
          우리의 일상 수업을 함께 나눕니다.
        </h1>
        <p className="text-sm leading-relaxed text-muted sm:text-base">
          약수초등학교의 공개수업을 확인하고 참관하고 싶은 수업을 신청해보세요.
        </p>
      </section>

      {!isLoading && todayLessons.length > 0 && (
        <section className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary-light/40 p-5">
          <div className="flex items-center gap-2 text-primary-dark">
            <Sparkles size={18} />
            <h2 className="text-base font-bold">오늘의 수업</h2>
          </div>
          <div className="flex flex-col gap-2">
            {todayLessons.map((lesson) => (
              <button
                key={lesson.id}
                type="button"
                onClick={() => openDetail(lesson)}
                className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 text-left shadow-soft hover:-translate-y-0.5 hover:shadow-soft-lg"
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-bold text-foreground">{lesson.title}</p>
                  <p className="text-xs text-muted">
                    {formatLessonTime(lesson.startTime, lesson.endTime)} · {lesson.teacher} 선생님 ·{" "}
                    {lesson.location}
                  </p>
                </div>
                <StatusBadge status={getLessonStatus(lesson)} />
              </button>
            ))}
          </div>
        </section>
      )}

      <LessonStats lessons={publishedLessons} />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">공개수업 일정</h2>
          <div className="flex rounded-full border border-border bg-surface p-1">
            <ViewToggleButton
              active={viewMode === "calendar"}
              onClick={() => setViewMode("calendar")}
              icon={<CalendarDays size={15} />}
              label="캘린더"
            />
            <ViewToggleButton
              active={viewMode === "card"}
              onClick={() => setViewMode("card")}
              icon={<LayoutGrid size={15} />}
              label="카드"
            />
          </div>
        </div>

        <LessonFilters value={filter} onChange={setFilter} />

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : loadError ? (
          <EmptyState
            title="수업 정보를 불러오지 못했습니다."
            description="잠시 후 페이지를 새로고침해 주세요."
          />
        ) : filteredLessons.length === 0 ? (
          <EmptyState
            title={
              publishedLessons.length === 0
                ? "등록된 공개수업이 아직 없습니다."
                : "조건에 맞는 공개수업이 없습니다."
            }
            description={
              publishedLessons.length === 0
                ? "관리자가 수업을 등록하면 이곳에 표시됩니다."
                : "검색어나 필터 조건을 변경해보세요."
            }
          />
        ) : viewMode === "calendar" ? (
          <LessonCalendar lessons={filteredLessons} onSelectLesson={openDetail} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} onClick={() => openDetail(lesson)} />
            ))}
          </div>
        )}
      </section>

      <LessonDetail
        lesson={selectedLesson}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onApply={() => {
          setIsDetailOpen(false);
          setIsApplyOpen(true);
        }}
      />

      {selectedLesson && (
        <ApplicationForm
          lesson={selectedLesson}
          isOpen={isApplyOpen}
          onClose={() => setIsApplyOpen(false)}
          onSubmit={handleApplySubmit}
        />
      )}
    </div>
  );
}

function ViewToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm ${
        active ? "bg-primary text-white" : "text-muted hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
