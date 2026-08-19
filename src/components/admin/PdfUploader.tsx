"use client";

import { useRef, useState, type ChangeEvent } from "react";
import toast from "react-hot-toast";
import { FileText, Trash2, Upload } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";

function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<{ success: boolean; error?: string; pdfUrl?: string }> {
  return new Promise((resolve) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ success: true, pdfUrl: data.pdfUrl });
        } else {
          resolve({ success: false, error: data.error ?? "업로드 중 오류가 발생했습니다." });
        }
      } catch {
        resolve({ success: false, error: "업로드 중 오류가 발생했습니다." });
      }
    };
    xhr.onerror = () => resolve({ success: false, error: "네트워크 오류가 발생했습니다." });
    xhr.send(formData);
  });
}

export default function PdfUploader({
  lessonId,
  pdfUrl,
  onChange,
}: {
  lessonId: string;
  pdfUrl: string | null;
  onChange: (pdfUrl: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("PDF 파일만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("파일 크기는 20MB 이하여야 합니다.");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    const result = await uploadWithProgress(`/api/admin/lessons/${lessonId}/pdf`, file, setProgress);
    setIsUploading(false);

    if (result.success) {
      toast.success("지도안 PDF가 업로드되었습니다.");
      onChange(result.pdfUrl ?? null);
    } else {
      toast.error(result.error ?? "업로드 중 오류가 발생했습니다.");
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/pdf`, { method: "DELETE" });
      if (res.ok) {
        toast.success("지도안 PDF가 삭제되었습니다.");
        onChange(null);
        setConfirmDelete(false);
      } else {
        toast.error("삭제 중 오류가 발생했습니다.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-foreground">지도안 PDF</label>

      {pdfUrl ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-3">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <FileText size={16} />
            지도안 보기
          </a>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-danger hover:bg-danger-light"
          >
            <Trash2 size={13} />
            삭제
          </button>
        </div>
      ) : (
        <p className="text-xs text-muted">등록된 지도안 PDF가 없습니다.</p>
      )}

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileSelected}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground/80 hover:bg-foreground/5 disabled:opacity-60"
        >
          <Upload size={15} />
          {pdfUrl ? "새 PDF로 교체" : "PDF 업로드"}
        </button>
      </div>

      {isUploading && (
        <div className="flex flex-col gap-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted">업로드 중... {progress}%</p>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="지도안 PDF를 삭제할까요?"
        description="삭제된 PDF는 복구할 수 없습니다."
        confirmLabel="삭제"
        isLoading={isDeleting}
        danger
      />
    </div>
  );
}
