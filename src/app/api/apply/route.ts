import { NextResponse } from "next/server";
import { submitApplication } from "@/lib/server/applications";
import { isValidPhone } from "@/lib/utils/validation";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("lessonId" in body) ||
    !("name" in body) ||
    !("organization" in body) ||
    !("phone" in body) ||
    !("privacyConsent" in body) ||
    !("photoConsent" in body)
  ) {
    return NextResponse.json({ success: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { lessonId, name, organization, phone, privacyConsent, photoConsent } = body as Record<
    string,
    unknown
  >;

  if (
    typeof lessonId !== "string" ||
    !lessonId ||
    typeof name !== "string" ||
    !name.trim() ||
    typeof organization !== "string" ||
    !organization.trim() ||
    typeof phone !== "string" ||
    !isValidPhone(phone) ||
    privacyConsent !== true ||
    photoConsent !== true
  ) {
    return NextResponse.json({ success: false, error: "입력값을 확인해 주세요." }, { status: 400 });
  }

  const result = await submitApplication({
    lessonId,
    name: name.trim(),
    organization: organization.trim(),
    phone,
    privacyConsent,
    photoConsent,
  });

  return NextResponse.json(result, { status: result.success ? 200 : 409 });
}
