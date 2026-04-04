/**
 * Base trend patterns (0–100 scale) used to generate realistic chart data.
 * Each array represents 12 data points that get interpolated to match the
 * actual number of buckets requested.
 */

/** Values decrease over time — good for cycle time, time-to-merge, etc. */
export const IMPROVING_TREND = [
  82, 78, 80, 74, 70, 65, 58, 52, 45, 38, 30, 24,
];

/** Values increase over time — good for deployment frequency. */
export const INCREASING_TREND = [
  12, 15, 14, 18, 22, 28, 32, 38, 42, 50, 55, 62,
];

/** Flat for a while, then improving in the last third. */
export const STABLE_WITH_IMPROVEMENT = [
  60, 62, 58, 61, 60, 59, 55, 48, 40, 35, 28, 22,
];

/** Low values with a slight downward trend — good for failure rate. */
export const LOW_FAILURE_RATE = [
  18, 20, 16, 15, 17, 14, 12, 13, 10, 9, 8, 6,
];

/** Time-to-first-review improving trend (hours → minutes feel). */
export const REVIEW_SPEED_IMPROVING = [
  48, 44, 42, 38, 35, 30, 26, 22, 18, 15, 12, 10,
];
