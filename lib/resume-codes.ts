export function reservationValidationError(label: string, code: string) {
  if (!label.trim()) return "Enter an application label.";
  if (code.length !== 6 || !/^[0-9a-fA-F]+$/.test(code)) {
    return "Enter exactly six hexadecimal characters (0–9, A–F or a–f).";
  }
  return null;
}

export function resumePortfolioUrl(code: string) {
  const url = new URL("https://khine.dev");
  url.searchParams.set("code", code);
  return url.toString();
}
