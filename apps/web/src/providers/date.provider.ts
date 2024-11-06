import {
  addDays,
  differenceInDays,
  format,
  formatDistanceToNow,
  formatDuration,
  intervalToDuration,
  isPast,
  parseISO,
  startOfWeek,
} from "date-fns";

export const msToHour = 1000 * 60 * 60;

export enum WeekDay {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export const humanizeDuration = (durationInMs: number) => {
  return formatDistanceToNow(new Date(Date.now() - durationInMs));
};

export const formatMsDuration = (durationInMs: number, format?: string[]) => {
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

export const getWeekDayName = (dayNumber: number) => {
  const startDate = startOfWeek(new Date(), { weekStartsOn: 0 });
  const dayDate = addDays(startDate, dayNumber);

  return format(dayDate, "EEEE");
};
