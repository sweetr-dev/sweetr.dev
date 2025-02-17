import { DayOfTheWeek } from "@sweetr/graphql-types/frontend/graphql";
import {
  differenceInDays,
  DurationUnit,
  format,
  formatDistanceToNow,
  formatDuration,
  intervalToDuration,
  isPast,
  parseISO,
} from "date-fns";

export const msToHour = 1000 * 60 * 60;

export const humanizeDuration = (durationInMs: number) => {
  return formatDistanceToNow(new Date(Date.now() - durationInMs));
};

export const weekDays = [
  DayOfTheWeek.MONDAY,
  DayOfTheWeek.TUESDAY,
  DayOfTheWeek.WEDNESDAY,
  DayOfTheWeek.THURSDAY,
  DayOfTheWeek.FRIDAY,
];

export const formatMsDuration = (
  durationInMs: number,
  format?: DurationUnit[],
) => {
  const duration = intervalToDuration({
    start: new Date(Date.now() - durationInMs),
    end: new Date(),
  });

  return formatDuration(duration, { format, delimiter: ", " });
};

export const parseNullableISO = (
  date: string | null | undefined,
): Date | undefined => (date ? parseISO(date) : undefined);

export const getDaysLeft = (until: Date) => {
  if (isPast(until)) return null;

  return Math.max(0, differenceInDays(until, new Date()));
};

export const formatDate = (
  date: string | null | undefined,
  token: string,
): string => (date ? format(parseISO(date), token) : "");

export const getBrowserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
