import { describe, it, expect } from "vitest";
import { differenceInBusinessMilliseconds, subBusinessHours } from "./date";
import { utc } from "@date-fns/utc";
import { parseISO } from "date-fns";

describe("differenceInBusinessMilliseconds", () => {
  const hour = 60 * 60 * 1000;

  // endOfDay is at 23:59:59.999, so we need to subtract 1ms to assert the correct time
  const oneMsOffset = 1;

  it("should return correct difference for same day", () => {
    const startDate = new Date("2023-05-15T09:00:00");
    const endDate = new Date("2023-05-15T19:00:00");
    const result = differenceInBusinessMilliseconds(startDate, endDate);

    expect(result).toBe(10 * hour); // 10 hours in milliseconds
  });

  it("should return correct difference for consecutive business days", () => {
    const startDate = new Date("2023-05-15T14:00:00"); // Monday
    const endDate = new Date("2023-05-16T10:00:00"); // Tuesday
    const result = differenceInBusinessMilliseconds(startDate, endDate);

    expect(result).toBe((10 + 10) * hour - oneMsOffset);
  });

  it("should skip weekends", () => {
    const startDate = new Date("2023-05-19T17:00:00"); // Friday
    const endDate = new Date("2023-05-22T09:00:00"); // Monday
    const result = differenceInBusinessMilliseconds(startDate, endDate);

    expect(result).toBe((7 + 9) * hour - oneMsOffset);
  });

  it("should handle start date on weekend", () => {
    const startDate = new Date("2023-05-20T12:00:00"); // Saturday
    const endDate = new Date("2023-05-22T17:00:00"); // Monday
    const result = differenceInBusinessMilliseconds(startDate, endDate);

    expect(result).toBe(17 * hour);
  });

  it("should handle end date on weekend", () => {
    const startDate = new Date("2023-05-19T14:00:00"); // Friday
    const endDate = new Date("2023-05-21T10:00:00"); // Sunday
    const result = differenceInBusinessMilliseconds(startDate, endDate);

    expect(result).toBe(10 * hour - oneMsOffset);
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

describe("subBusinessHours", () => {
  it("should subtract one hour from a Sunday 1 AM and return Friday 11 PM", () => {
    const inputDate = utc(parseISO("2024-02-18T01:00:00Z")); // Sunday 12 AM
    const result = subBusinessHours(inputDate, 1);
    expect(result.toISOString()).toBe("2024-02-16T22:59:59.999Z"); // Friday 11 PM
  });

  it("should subtract one hour from a Saturday 1 AM and return Friday 11 PM", () => {
    const inputDate = utc(parseISO("2024-02-17T01:00:00Z")); // Saturday 01 AM
    const result = subBusinessHours(inputDate, 1);
    expect(result.toISOString()).toBe("2024-02-16T22:59:59.999Z"); // Friday 11 PM
  });

  it("should subtract multiple hours from early Monday 1 AM and go back to Friday 10 PM", () => {
    const inputDate = utc(parseISO("2024-02-19T01:00:00Z")); // Monday 1 AM
    const result = subBusinessHours(inputDate, 3);
    expect(result.toISOString()).toBe("2024-02-16T21:59:59.999Z"); // Friday 10 PM
  });

  it("should subtract six hours from Thursday 3 PM and return Thursday 9 AM", () => {
    const inputDate = utc(parseISO("2024-02-15T15:00:00Z")); // Thursday 3 PM
    const result = subBusinessHours(inputDate, 6);
    expect(result.toISOString()).toBe("2024-02-15T09:00:00.000Z"); // Thursday 9 AM
  });

  it("should return the same date if subtracting 0 hours", () => {
    const inputDate = utc(parseISO("2024-02-14T12:00:00Z")); // Wednesday noon
    const result = subBusinessHours(inputDate, 0);
    expect(result.toISOString()).toBe(inputDate.toISOString());
  });

  it("should correctly handle going back a full week", () => {
    const inputDate = utc(parseISO("2024-02-16T23:00:00Z")); // Friday 11 PM
    const result = subBusinessHours(inputDate, 5 * 24);
    expect(result.toISOString()).toBe("2024-02-09T22:59:59.999Z"); // Friday 6 PM
  });

  it("should correctly handle midnight transitions on weekdays", () => {
    const inputDate = utc(parseISO("2024-02-13T00:30:00Z")); // Tuesday 12:30 AM
    const result = subBusinessHours(inputDate, 2);
    expect(result.toISOString()).toBe("2024-02-12T22:30:00.000Z"); // Monday 10:30 PM
  });

  it("should correctly handle midnight transitions crossing a weekend", () => {
    const inputDate = utc(parseISO("2024-02-19T00:30:00Z")); // Monday 1:30 AM
    const result = subBusinessHours(inputDate, 1);
    expect(result.toISOString()).toBe("2024-02-16T23:29:59.999Z"); // Friday 11:29 PM
  });
});
