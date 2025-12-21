import { Period } from "../../../graphql-types";

export const periodToDateTrunc = (period: Period): string => {
  const dateTruncMap: Record<Period, string> = {
    DAILY: "day",
    WEEKLY: "week",
    MONTHLY: "month",
    QUARTERLY: "quarter",
    YEARLY: "year",
  };

  return dateTruncMap[period];
};

export const periodToInterval = (period: Period): string => {
  const intervalMap: Record<Period, string> = {
    DAILY: "1 day",
    WEEKLY: "1 week",
    MONTHLY: "1 month",
    QUARTERLY: "3 months",
    YEARLY: "1 year",
  };

  return intervalMap[period];
};
