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
