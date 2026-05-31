export function formatVnd(value: number): string {
  return `${value.toLocaleString("vi-VN")} đ`;
}

export function formatEffectiveDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}
