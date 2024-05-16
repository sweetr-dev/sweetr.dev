import {
  formatDistanceToNow,
  formatDuration,
  intervalToDuration,
  parseISO,
} from "date-fns";

export const msToHour = 1000 * 60 * 60;

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
