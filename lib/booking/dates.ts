/**
 * Royal Palace — Date Utilities
 *
 * CRITICAL: All booking dates are treated as calendar dates (YYYY-MM-DD strings),
 * NOT as timestamps. This avoids any UTC/IST timezone drift issues.
 *
 * Royal Palace is in Kerala, India (IST = UTC+5:30).
 * We NEVER use new Date(dateStr).toISOString() for date-only logic.
 */

/**
 * Returns today's date as YYYY-MM-DD in local time.
 * Do NOT use new Date().toISOString().split("T")[0] — that returns UTC date
 * which may be yesterday evening in India.
 */
export function todayDateStr(): string {
  const now = new Date();
  return formatDateStr(now);
}

/**
 * Formats a Date object to YYYY-MM-DD using local time components.
 */
export function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Parses a YYYY-MM-DD string into a local-time Date object at midnight.
 * Avoids the UTC-midnight-to-local shift that new Date("2026-10-15") causes.
 */
export function parseDateStr(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Validates that a string is a valid YYYY-MM-DD date.
 */
export function isValidDateStr(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = parseDateStr(dateStr);
  return !isNaN(d.getTime());
}

/**
 * Compares two YYYY-MM-DD strings lexicographically (works because format is sortable).
 * Returns: negative if a < b, 0 if equal, positive if a > b.
 */
export function compareDateStrs(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Returns the number of nights between checkIn and checkOut.
 * Checkout is NOT an occupied night.
 */
export function countNights(checkIn: string, checkOut: string): number {
  const ci = parseDateStr(checkIn);
  const co = parseDateStr(checkOut);
  return Math.round((co.getTime() - ci.getTime()) / 86_400_000);
}

/**
 * Returns an array of all calendar nights for a stay.
 * checkOut date is NOT included (checkout night is not occupied).
 *
 * Example: checkIn=Oct 11, checkOut=Oct 13 → ["2026-10-11", "2026-10-12"]
 */
export function getOccupiedNights(checkIn: string, checkOut: string): string[] {
  const dates: string[] = [];
  const ci = parseDateStr(checkIn);
  const co = parseDateStr(checkOut);
  const cur = new Date(ci);
  while (cur < co) {
    dates.push(formatDateStr(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/**
 * Returns all YYYY-MM-DD strings in a range [from, to) inclusive of from, exclusive of to.
 * Use for calendar display (include both endpoints for visual range).
 */
export function dateRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const cur = parseDateStr(from);
  const end = parseDateStr(to);
  while (cur <= end) {
    dates.push(formatDateStr(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/**
 * Adds N days to a YYYY-MM-DD string and returns the new YYYY-MM-DD string.
 */
export function addDaysToDateStr(dateStr: string, days: number): string {
  const d = parseDateStr(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateStr(d);
}

/**
 * Returns the first day of the month for a given YYYY-MM-DD date.
 */
export function firstDayOfMonth(dateStr: string): string {
  const [y, m] = dateStr.split("-");
  return `${y}-${m}-01`;
}

/**
 * Returns the last day of the month for a given YYYY-MM-DD date.
 */
export function lastDayOfMonth(dateStr: string): string {
  const d = parseDateStr(dateStr);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return formatDateStr(last);
}

/**
 * Returns the YYYY-MM-DD for the start of a month N months from now.
 */
export function monthOffsetStart(offsetMonths: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
  return formatDateStr(d);
}

/**
 * Formats a YYYY-MM-DD string to a human-readable display string.
 * e.g. "2026-10-15" → "15 Oct 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  const d = parseDateStr(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formats a price in INR with Indian number grouping.
 * e.g. 120000 → "₹1,20,000"
 */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Compact price for calendar cells.
 * e.g. 12000 → "₹12k", 15500 → "₹15.5k", 150000 → "₹1.5L"
 */
export function formatCompactINR(amount: number): string {
  if (amount >= 100000) {
    const l = amount / 100000;
    return `₹${l % 1 === 0 ? l : l.toFixed(1)}L`;
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    return `₹${k % 1 === 0 ? k : k.toFixed(1)}k`;
  }
  return `₹${amount}`;
}

/**
 * Checks if two date ranges overlap using the standard hotel algorithm:
 * existingCheckIn < newCheckOut AND existingCheckOut > newCheckIn
 */
export function dateRangesOverlap(
  existingCheckIn: string,
  existingCheckOut: string,
  newCheckIn: string,
  newCheckOut: string
): boolean {
  return existingCheckIn < newCheckOut && existingCheckOut > newCheckIn;
}
