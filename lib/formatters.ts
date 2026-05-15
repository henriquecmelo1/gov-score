export function formatCurrencyBRL(value: number | string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value) || 0);
}

export function formatDateBR(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return "-";

  // Date-only strings (e.g. "2026-05-14") are parsed as UTC midnight by new Date(),
  // which shifts the display to the previous day in negative-UTC timezones like BRT (UTC-3).
  // Appending T00:00:00 forces local-time interpretation.
  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    dateValue = dateValue + "T00:00:00";
  }

  return new Date(dateValue).toLocaleDateString("pt-BR");
}

export function getFileNameFromUrl(url: string): string {
  const sanitized = url.split("?")[0];
  const fileName = sanitized.split("/").pop();
  return fileName ? decodeURIComponent(fileName) : "arquivo.pdf";
}
