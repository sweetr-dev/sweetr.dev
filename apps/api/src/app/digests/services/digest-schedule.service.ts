import { DayOfTheWeek, Frequency } from "@prisma/client";
import { getBypassRlsPrisma } from "../../../prisma";
import { isActiveCustomer } from "../../workspace-authorization.service";
import { Digest, DigestWithWorkspace } from "./digest.types";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import { captureException } from "../../../lib/sentry";
import { TZDate } from "@date-fns/tz";
import { format, getDate, getDay } from "date-fns";

export const findScheduledDigests = async (date: Date): Promise<Digest[]> => {
  // Only retrieve monthly digests if we are in the first week of the month
  const currentDayOfMonth = getDate(date);
  const includeMonthly = currentDayOfMonth < 8;

  const digests = await getBypassRlsPrisma().digest.findMany({
    where: {
      enabled: true,
      frequency: includeMonthly ? undefined : Frequency.WEEKLY,
    },
    include: {
      workspace: {
        include: {
          subscription: true,
          installation: true,
        },
      },
    },
  });

  const scheduledDigests = digests.filter((digest) =>
    isScheduled(digest as DigestWithWorkspace, date)
  );

  return scheduledDigests as DigestWithWorkspace[];
};

const isScheduled = (digest: DigestWithWorkspace, date: Date) => {
  const zonedDate = new TZDate(date, digest.timezone);
  const timeOfDay = format(zonedDate, "HH:mm");
  const dayOfTheWeek = getDayOfTheWeek(getDay(zonedDate));

  if (!dayOfTheWeek) {
    captureException(
      new InputValidationException("Digest has invalid day of the week", {
        extra: { digest },
      })
    );

    return false;
  }

  // Check if the local day and time match the digest's schedule
  const isCorrectDay = digest.dayOfTheWeek.includes(dayOfTheWeek);
  const isCorrectTime = digest.timeOfDay === timeOfDay;

  return isCorrectDay && isCorrectTime && canSendDigest(digest);
};

const getDayOfTheWeek = (weekDay: number): DayOfTheWeek => {
  return [
    DayOfTheWeek.SUNDAY,
    DayOfTheWeek.MONDAY,
    DayOfTheWeek.TUESDAY,
    DayOfTheWeek.WEDNESDAY,
    DayOfTheWeek.THURSDAY,
    DayOfTheWeek.FRIDAY,
    DayOfTheWeek.SATURDAY,
  ][weekDay];
};

export const canSendDigest = (digest: DigestWithWorkspace): boolean => {
  if (!isActiveCustomer(digest.workspace)) return false;

  if (!digest.workspace.installation) return false;

  return true;
};
