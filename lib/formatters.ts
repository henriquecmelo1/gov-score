export function formatCurrencyBRL(value: number | string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value) || 0);
}

export function formatDateBR(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleDateString("pt-BR");
}

export function getFileNameFromUrl(url: string): string {
  const sanitized = url.split("?")[0];
  const fileName = sanitized.split("/").pop();
  return fileName ? decodeURIComponent(fileName) : "arquivo.pdf";
}
