import {
  addDays,
  addWeeks,
  addMonths,
  addQuarters,
  addYears,
  parseISO,
  isBefore,
} from "date-fns";
import { Period } from "@sweetr/graphql-types/frontend/graphql";

const stepFns: Record<Period, (date: Date, amount: number) => Date> = {
  [Period.DAILY]: addDays,
  [Period.WEEKLY]: addWeeks,
  [Period.MONTHLY]: addMonths,
  [Period.QUARTERLY]: addQuarters,
  [Period.YEARLY]: addYears,
};

export function generateBuckets(
  from: string,
  to: string,
  period: Period,
): string[] {
  const start = parseISO(from);
  const end = parseISO(to);
  const step = stepFns[period];
  const buckets: string[] = [];
  let cursor = start;

  while (isBefore(cursor, end) || cursor.getTime() === end.getTime()) {
    buckets.push(cursor.toISOString());
    cursor = step(cursor, 1);
  }

  return buckets;
}

/**
 * Maps a base pattern to the desired length via linear interpolation,
 * then scales values and adds deterministic jitter for realism.
 */
export function mapPattern(
  pattern: number[],
  length: number,
  scale = 1,
  jitterPercent = 0.08,
): number[] {
  if (length <= 0) return [];
  if (length === 1) return [Math.round(pattern[0] * scale)];

  const result: number[] = [];

  for (let i = 0; i < length; i++) {
    const t = (i / (length - 1)) * (pattern.length - 1);
    const lo = Math.floor(t);
    const hi = Math.min(lo + 1, pattern.length - 1);
    const frac = t - lo;
    const base = pattern[lo] * (1 - frac) + pattern[hi] * frac;

    const seed = ((i * 9301 + 49297) % 233280) / 233280;
    const jitter = 1 + (seed - 0.5) * 2 * jitterPercent;

    result.push(Math.max(0, Math.round(base * scale * jitter)));
  }

  return result;
}

/**
 * Convenience: generate columns + data in one call.
 */
export function generateChartData(
  from: string,
  to: string,
  period: Period,
  pattern: number[],
  scale = 1,
): { columns: string[]; data: number[] } {
  const columns = generateBuckets(from, to, period);
  const data = mapPattern(pattern, columns.length, scale);
  return { columns, data };
}
