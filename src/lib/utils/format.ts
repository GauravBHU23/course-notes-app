// Humanize a bundle's validity_days into a friendly label, e.g. 180 -> "6 months".
export function formatValidity(days: number): string {
  if (days % 365 === 0) {
    const years = days / 365;
    return years === 1 ? "1 year" : `${years} years`;
  }
  if (days % 30 === 0) {
    const months = days / 30;
    return months === 1 ? "1 month" : `${months} months`;
  }
  if (days === 1) return "1 day";
  return `${days} days`;
}

export function formatPriceInr(priceInr: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(priceInr);
}
