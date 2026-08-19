import { NextResponse } from "next/server";
import { searchApplications } from "@/lib/server/check";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { name, phoneLast4 } = body as Record<string, unknown>;

  if (typeof name !== "string" || !name.trim() || typeof phoneLast4 !== "string" || !/^\d{4}$/.test(phoneLast4)) {
    return NextResponse.json({ error: "이름과 전화번호 뒤 4자리를 확인해 주세요." }, { status: 400 });
  }

  const results = await searchApplications(name.trim(), phoneLast4);
  return NextResponse.json({ results });
}
