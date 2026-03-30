export function formatCurrency(value: number, unit = 'USD/gal') {
  return `${value.toFixed(3)} ${unit}`;
}

export function formatTimestamp(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatPeriodLabel(period: string) {
  if (/^\d{8}$/.test(period)) {
    const month = period.slice(4, 6);
    const day = period.slice(6, 8);
    return `${month}/${day}`;
  }
  return period;
}
