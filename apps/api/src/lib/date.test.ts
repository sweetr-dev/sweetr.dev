import { describe, it, expect } from "vitest";
import { differenceInBusinessMilliseconds } from "./date";

describe("differenceInBusinessMilliseconds", () => {
  const hour = 60 * 60 * 1000;

  // endOfDay is at 23:59:59.999, so we need to subtract 1ms to assert the correct time when
  const oneMsOffset = 1;

  it("should return correct difference for same day", () => {
    const startDate = new Date("2023-05-15T09:00:00");
    const endDate = new Date("2023-05-15T19:00:00");
    const result = differenceInBusinessMilliseconds(startDate, endDate);

    expect(result).toBe(10 * hour); // 8 hours in milliseconds
  });

  it("should return correct difference for consecutive business days", () => {
    const startDate = new Date("2023-05-15T14:00:00"); // Monday
    const endDate = new Date("2023-05-16T10:00:00"); // Tuesday
    const result = differenceInBusinessMilliseconds(startDate, endDate);

    expect(result).toBe((10 + 10) * hour - oneMsOffset); // 20 hours in milliseconds
  });

  it("should skip weekends", () => {
    const startDate = new Date("2023-05-19T17:00:00"); // Friday
    const endDate = new Date("2023-05-22T09:00:00"); // Monday
    const result = differenceInBusinessMilliseconds(startDate, endDate);

    expect(result).toBe((7 + 9) * hour - oneMsOffset); // 16 hours in milliseconds
  });

  it("should handle start date on weekend", () => {
    const startDate = new Date("2023-05-20T12:00:00"); // Saturday
    const endDate = new Date("2023-05-22T17:00:00"); // Monday
    const result = differenceInBusinessMilliseconds(startDate, endDate);

    expect(result).toBe(17 * hour); // 17 hours in milliseconds
  });

  it("should handle end date on weekend", () => {
    const startDate = new Date("2023-05-19T14:00:00"); // Friday
    const endDate = new Date("2023-05-21T10:00:00"); // Sunday
    const result = differenceInBusinessMilliseconds(startDate, endDate);

    expect(result).toBe(10 * hour - oneMsOffset); // 10 hours in milliseconds
  });

  it("should return zero for weekend to weekend", () => {
    const startDate = new Date("2023-05-20T12:00:00"); // Saturday
    const endDate = new Date("2023-05-21T12:00:00"); // Sunday
    const result = differenceInBusinessMilliseconds(startDate, endDate);

    expect(result).toBe(0);
  });

  it("should handle multiple weeks correctly", () => {
    const startDate = new Date("2023-05-01T10:00:00"); // Monday
    const endDate = new Date("2023-05-15T14:00:00"); // Monday, two weeks later
    const result = differenceInBusinessMilliseconds(startDate, endDate);

    const fullDays = 9 * (24 * hour);

    expect(result).toBe(fullDays + (14 + 14) * hour - oneMsOffset);
  });

  it("should return negative value when start time is after end time on the same day", () => {
    const startDate = new Date("2023-05-15T14:00:00");
    const endDate = new Date("2023-05-15T10:00:00");
    const result = differenceInBusinessMilliseconds(startDate, endDate);

    expect(result).toBe(-4 * hour);
  });

  it("should return negative value when start date is after end date", () => {
    const startDate = new Date("2023-05-16T10:00:00"); // Tuesday
    const endDate = new Date("2023-05-15T14:00:00"); // Monday
    const result = differenceInBusinessMilliseconds(startDate, endDate);

    expect(result).toBe(-20 * hour - oneMsOffset);
  });

  it("should handle start time at midnight", () => {
    const startDate = new Date("2023-05-15T00:00:00"); // Monday midnight
    const endDate = new Date("2023-05-15T14:00:00"); // Monday 2 PM
    const result = differenceInBusinessMilliseconds(startDate, endDate);

    expect(result).toBe(14 * hour);
  });

  it("should handle end time at midnight", () => {
    const startDate = new Date("2023-05-15T10:00:00"); // Monday 10 AM
    const endDate = new Date("2023-05-16T00:00:00"); // Tuesday midnight
    const result = differenceInBusinessMilliseconds(startDate, endDate);

    expect(result).toBe(14 * hour - oneMsOffset);
  });
});
