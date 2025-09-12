import { useMantineTheme } from "@mantine/core";
import {
  PullRequest,
  PullRequestState,
} from "@sweetr/graphql-types/frontend/graphql";
import { parseISO, format } from "date-fns";
import {
  formatDateAgo,
  getTimezoneGmtLabel,
  parseNullableISO,
} from "../../providers/date.provider";

export const usePrCard = (
  pullRequest: Pick<
    PullRequest,
    "mergedAt" | "closedAt" | "createdAt" | "state"
  >,
) => {
  const theme = useMantineTheme();

  const mergedAt = parseNullableISO(pullRequest.mergedAt);
  const closedAt = parseNullableISO(pullRequest.closedAt);
  const createdAt = parseISO(pullRequest.createdAt);

  const getCommentFlameProps = (comments: number) => {
    if (comments >= 30) {
      return { color: theme.colors.red[8], fill: theme.colors.red[8] };
    }

    if (comments >= 20) {
      return { color: theme.colors.red[6] };
    }

    return { color: theme.colors.red[4] };
  };

  const getTimeTooltipLabel = (date: Date) => {
    return `${format(date, "MMMM do, yyyy")} at ${format(date, "hh:mm a")} (${getTimezoneGmtLabel()})`;
  };

  const getTimeLabel = (type: "relative" | "ago") => {
    if (mergedAt) {
      return {
        timeLabel: `Merged ${formatDateAgo(mergedAt, type)}`,
        timeTooltipLabel: getTimeTooltipLabel(mergedAt),
      };
    }

    if (closedAt) {
      return {
        timeLabel: `Closed ${formatDateAgo(closedAt, type)}`,
        timeTooltipLabel: getTimeTooltipLabel(closedAt),
      };
    }

    if (pullRequest.state === PullRequestState.DRAFT) {
      return {
        timeLabel: `Drafted ${formatDateAgo(createdAt, type)}`,
        timeTooltipLabel: getTimeTooltipLabel(createdAt),
      };
    }

    return {
      timeLabel: `Opened ${formatDateAgo(createdAt, type)}`,
      timeTooltipLabel: getTimeTooltipLabel(createdAt),
    };
  };

  return {
    getCommentFlameProps,
    getTimeLabel,
  };
};
