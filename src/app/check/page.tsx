"use client";

import ApplicationCheck from "@/components/applications/ApplicationCheck";
import type { CheckResultItem } from "@/lib/server/check";

async function handleSearch(name: string, phoneLast4: string): Promise<CheckResultItem[]> {
  const res = await fetch("/api/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phoneLast4 }),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { results: CheckResultItem[] };
  return data.results;
}

export default function CheckPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <section className="flex flex-col gap-2 text-center sm:text-left">
        <h1 className="text-2xl font-black text-foreground">신청 확인</h1>
        <p className="text-sm text-muted">
          이름과 휴대전화번호 뒤 4자리를 입력하면 신청하신 참관 내역을 확인할 수 있습니다.
        </p>
      </section>

      <ApplicationCheck onSearch={handleSearch} />
    </div>
  );
}
