/**
 * Formats a millisecond duration as a short "3d 4h" / "1h 30m" / "45m"
 * string. Minutes are dropped once the duration spans whole days, to keep
 * multi-day gaps readable rather than showing spurious precision.
 */
export function formatDuration(ms: number): string {
  if (ms <= 0) return "0m";

  const totalMinutes = Math.round(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (days === 0 && minutes > 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(" ") : "0m";
}
