import {
  addMinutes,
  differenceInBusinessDays,
  differenceInMilliseconds,
  DurationUnit,
  endOfDay,
  formatDuration,
  intervalToDuration,
  isSameDay,
  isSaturday,
  isSunday,
  isWeekend,
  parseISO,
  startOfDay,
  subDays,
  subHours,
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

export const getDateYmd = (date: Date) => {
  return date.toISOString().split("T")[0];
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

export const subBusinessHours = (date: Date, hours: number): Date => {
  let remainingHours = hours;
  let currentDate = date;
  let minutesDiff = 0;

  while (remainingHours > 0) {
    if (isWeekend(currentDate) && minutesDiff === 0) {
      minutesDiff += currentDate.getMinutes();
    }

    if (isSunday(currentDate)) {
      currentDate = endOfDay(subDays(currentDate, 2));
    }

    if (isSaturday(currentDate)) {
      currentDate = endOfDay(subDays(currentDate, 1));
    }

    currentDate = subHours(currentDate, 1);

    if (!isWeekend(currentDate) || minutesDiff) {
      remainingHours--;
    }
  }

  return addMinutes(currentDate, minutesDiff);
};
