export function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}
