"use client";

import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  isLoading = false,
  danger = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  danger?: boolean;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidthClassName="max-w-sm">
      <div className="flex flex-col gap-5">
        {description && <p className="text-sm leading-relaxed text-muted">{description}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground/80 transition-colors hover:bg-foreground/5 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
              danger ? "bg-danger hover:bg-danger/90" : "bg-primary hover:bg-primary-dark"
            }`}
          >
            {isLoading && <Spinner className="h-4 w-4" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
