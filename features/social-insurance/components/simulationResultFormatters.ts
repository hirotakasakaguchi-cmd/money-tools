export function formatNumber(value: number) {
  return new Intl.NumberFormat("ja-JP").format(Math.round(value));
}

export function formatYen(value: number) {
  return `${formatNumber(value)}円`;
}

export function formatSignedYen(value: number) {
  const rounded = Math.round(value);

  if (rounded === 0) {
    return "0円";
  }

  return `${rounded > 0 ? "+" : "-"}${formatNumber(Math.abs(rounded))}円`;
}

export function formatOptionalYen(value: number | null) {
  return value === null ? "未確認" : formatYen(value);
}

export function formatOptionalSignedYen(value: number | null) {
  return value === null ? "未確認" : formatSignedYen(value);
}

export function formatStandardMonthlyRemuneration(value: number) {
  return value > 0 ? formatYen(value) : "対象外";
}
