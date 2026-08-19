const PHONE_REGEX = /^01[0-9]-\d{3,4}-\d{4}$/;

export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

/** 숫자만 입력해도 010-1234-5678 형태로 자동 정렬 */
export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length < 11) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

export function getPhoneLast4(phone: string): string {
  return phone.replace(/\D/g, "").slice(-4);
}
