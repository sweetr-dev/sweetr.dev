import { UTCDate } from "@date-fns/utc";
import { DayOfTheWeek } from "@sweetr/graphql-types/frontend/graphql";
import {
  differenceInDays,
  DurationUnit,
  format,
  formatDistanceToNow,
  formatDuration,
  formatRelative,
  intervalToDuration,
  isPast,
  parseISO,
  subDays,
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

const formatterCache = new Map<string, Intl.DateTimeFormat>();

export const formatLocaleDate = (
  date: Date,
  options: Intl.DateTimeFormatOptions,
) => {
  const key = navigator.language + JSON.stringify(options);
  let formatter = formatterCache.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(navigator.language, options);
    formatterCache.set(key, formatter);
  }

  const parts = formatter.formatToParts(date);

  return parts
    .map((p) => (p.type === "literal" && p.value === ", " ? " " : p.value))
    .join("")
    .trim();
};

export const getBrowserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const getTimezoneGmtLabel = () => {
  const offset = new Date().getTimezoneOffset() / -60;

  return `GMT${offset > 0 ? "+" : ""}${offset}`;
};

export const formatDateAgo = (date: Date, type: "relative" | "ago") => {
  if (type === "ago") {
    return formatDistanceToNow(date, {
      addSuffix: true,
    });
  }

  return formatRelative(date, new Date());
};

export const thirtyDaysAgo = () => {
  return subDays(new UTCDate(), 30);
};
