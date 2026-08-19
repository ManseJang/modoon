import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="약수초등학교 마크" width={40} height={40} className="rounded-full" />
          <div className="flex flex-col gap-0.5">
            <p className="text-base font-bold text-foreground">약수초등학교</p>
            <p className="text-xs tracking-wide text-muted">YAKSU ELEMENTARY SCHOOL</p>
          </div>
        </div>
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} 약수초등학교 · 일상수업공개 참관신청 시스템{" "}
          <span className="font-semibold text-primary">모두ON</span>
        </p>
      </div>
    </footer>
  );
}
