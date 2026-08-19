"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import type { Lesson } from "@/types/lesson";
import type { ApplicationFormInput } from "@/types/application";
import { formatLessonDate, formatLessonTime } from "@/lib/utils/date";
import { formatPhoneInput, isValidPhone } from "@/lib/utils/validation";
import { PHOTO_CONSENT_DETAIL, PRIVACY_CONSENT_DETAIL } from "@/lib/consent-text";

type Step = "form" | "review" | "success";

export interface ApplicationSubmitResult {
  success: boolean;
  error?: string;
}

export default function ApplicationForm({
  lesson,
  isOpen,
  onClose,
  onSubmit,
}: {
  lesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: ApplicationFormInput) => Promise<ApplicationSubmitResult>;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(false);
  const [detailView, setDetailView] = useState<"privacy" | "photo" | null>(null);
  const [errors, setErrors] = useState<{ name?: string; organization?: string; phone?: string }>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetAndClose() {
    setStep("form");
    setName("");
    setOrganization("");
    setPhone("");
    setPrivacyConsent(false);
    setPhotoConsent(false);
    setErrors({});
    setSubmitError("");
    setIsSubmitting(false);
    onClose();
  }

  function handleReview() {
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = "성함을 입력해 주세요.";
    if (!organization.trim()) nextErrors.organization = "소속을 입력해 주세요.";
    if (!isValidPhone(phone)) nextErrors.phone = "010-0000-0000 형식으로 입력해 주세요.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setStep("review");
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const result = await onSubmit({
        name: name.trim(),
        organization: organization.trim(),
        phone,
        privacyConsent,
        photoConsent,
      });
      if (result.success) {
        setStep("success");
      } else {
        setSubmitError(result.error ?? "신청 처리 중 문제가 발생했습니다. 다시 시도해 주세요.");
      }
    } catch {
      setSubmitError("신청 처리 중 문제가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const canProceed = privacyConsent && photoConsent;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={resetAndClose}
        title={step === "success" ? "신청 완료" : "참관 신청하기"}
      >
        {step === "form" && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground" htmlFor="app-name">
                성함 <span className="text-danger">*</span>
              </label>
              <input
                id="app-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground" htmlFor="app-org">
                소속 <span className="text-danger">*</span>
              </label>
              <input
                id="app-org"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="예: 약수초등학교"
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              {errors.organization && <p className="text-xs text-danger">{errors.organization}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground" htmlFor="app-phone">
                연락처 <span className="text-danger">*</span>
              </label>
              <input
                id="app-phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                placeholder="010-1234-5678"
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              {errors.phone && <p className="text-xs text-danger">{errors.phone}</p>}
            </div>

            <div className="flex flex-col gap-3 rounded-xl bg-primary-light/40 p-4">
              <ConsentRow
                label="개인정보 수집 및 이용 동의 (필수)"
                checked={privacyConsent}
                onChange={setPrivacyConsent}
                onDetail={() => setDetailView("privacy")}
              />
              <ConsentRow
                label="수업 촬영 및 초상권 관련 동의 (필수)"
                checked={photoConsent}
                onChange={setPhotoConsent}
                onDetail={() => setDetailView("photo")}
              />
            </div>

            <button
              type="button"
              onClick={handleReview}
              disabled={!canProceed}
              className="rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-foreground/15 disabled:text-foreground/40"
            >
              다음
            </button>
          </div>
        )}

        {step === "review" && (
          <div className="flex flex-col gap-5">
            <p className="text-sm font-semibold text-foreground">신청 내용을 확인해주세요.</p>
            <dl className="flex flex-col gap-2.5 rounded-xl border border-border p-4 text-sm">
              <ReviewRow label="성함" value={name} />
              <ReviewRow label="소속" value={organization} />
              <ReviewRow label="연락처" value={phone} />
              <ReviewRow label="신청 수업" value={lesson.title} />
              <ReviewRow label="수업 일시" value={`${formatLessonDate(lesson.date)} ${lesson.startTime}`} />
            </dl>

            {submitError && (
              <p className="rounded-xl bg-danger-light px-4 py-3 text-sm text-danger">{submitError}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("form")}
                disabled={isSubmitting}
                className="flex-1 rounded-xl border border-border py-3.5 text-sm font-semibold text-foreground/80 hover:bg-foreground/5 disabled:opacity-50"
              >
                이전
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting && <Spinner className="h-4 w-4" />}
                신청하기
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-5 py-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-light text-accent">
              <CheckCircle2 size={34} />
            </div>
            <p className="text-lg font-bold text-foreground">참관 신청이 완료되었습니다!</p>

            <dl className="flex w-full flex-col gap-2.5 rounded-xl border border-border p-4 text-left text-sm">
              <ReviewRow label="수업명" value={lesson.title} />
              <ReviewRow label="날짜" value={formatLessonDate(lesson.date)} />
              <ReviewRow label="시간" value={formatLessonTime(lesson.startTime, lesson.endTime)} />
              <ReviewRow label="장소" value={lesson.location} />
              <ReviewRow label="담당 교사" value={`${lesson.teacher} 선생님`} />
            </dl>

            <div className="flex w-full gap-2">
              <button
                type="button"
                onClick={resetAndClose}
                className="flex-1 rounded-xl border border-border py-3.5 text-sm font-semibold text-foreground/80 hover:bg-foreground/5"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAndClose();
                  router.push("/check");
                }}
                className="flex-1 rounded-xl bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary-dark"
              >
                신청 확인하기
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={detailView !== null}
        onClose={() => setDetailView(null)}
        title={detailView === "privacy" ? "개인정보 수집 및 이용 동의" : "수업 촬영 및 초상권 관련 동의"}
        maxWidthClassName="max-w-md"
      >
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
          {detailView === "privacy" ? PRIVACY_CONSENT_DETAIL : PHOTO_CONSENT_DETAIL}
        </p>
      </Modal>
    </>
  );
}

function ConsentRow({
  label,
  checked,
  onChange,
  onDetail,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  onDetail: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 shrink-0 rounded border-border accent-primary"
        />
        {label}
      </label>
      <button
        type="button"
        onClick={onDetail}
        className="shrink-0 text-xs font-semibold text-primary underline underline-offset-2"
      >
        자세히 보기
      </button>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="text-right font-semibold text-foreground">{value}</dd>
    </div>
  );
}
