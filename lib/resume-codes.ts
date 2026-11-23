export const MAX_RESUME_PDF_BYTES = 2 * 1024 * 1024;

export function isResumeCode(code: string) {
  return code.length === 6 && /^[0-9a-fA-F]+$/.test(code);
}

export function reservationValidationError(label: string, code: string) {
  if (!label.trim()) return "Enter an application label.";
  if (!isResumeCode(code)) {
    return "Enter exactly six hexadecimal characters (0–9, A–F or a–f).";
  }
  return null;
}

export function resumePortfolioUrl(code: string) {
  const url = new URL("https://khine.dev");
  url.searchParams.set("code", code);
  return url.toString();
}
