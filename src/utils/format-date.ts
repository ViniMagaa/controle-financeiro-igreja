export function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}
