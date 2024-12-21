import {
  differenceInBusinessDays,
  differenceInMilliseconds,
  DurationUnit,
  endOfDay,
  formatDuration,
  intervalToDuration,
  isSameDay,
  isWeekend,
  parseISO,
  startOfDay,
} from "date-fns";

const msInADay = 86400000;

export const parseNullableISO = (
  date: string | null | undefined
): Date | null => (date ? parseISO(date) : null);

export const formatMsDuration = (
  durationInMs: number,
  format?: DurationUnit[]
) => {
  const duration = intervalToDuration({
    start: new Date(Date.now() - durationInMs),
    end: new Date(),
  });

  return formatDuration(duration, { format, delimiter: ", " });
};

export const differenceInBusinessMilliseconds = (
  startDate: Date,
  endDate: Date
): number => {
  if (isSameDay(startDate, endDate)) {
    return differenceInMilliseconds(endDate, startDate);
  }
  const businessDays = differenceInBusinessDays(endDate, startDate);
  const fixDifference = isWeekend(endDate) ? 0 : 1;
  let difference = (businessDays + fixDifference) * msInADay;

  if (!isWeekend(startDate)) {
    const totalTimeOnStartDate = differenceInMilliseconds(
      endOfDay(startDate),
      startDate
    );

    // Removes full day, and consider only time elapsed on the start date
    difference = difference - msInADay + totalTimeOnStartDate;
  }

  if (!isWeekend(endDate)) {
    const totalTimeOnEndDate = differenceInMilliseconds(
      endDate,
      startOfDay(endDate)
    );

    // Removes full day, and consider only time elapsed on the end date
    difference = difference - msInADay + totalTimeOnEndDate;
  }

  return difference;
};
