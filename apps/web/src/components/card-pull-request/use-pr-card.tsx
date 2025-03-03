import { useMantineTheme } from "@mantine/core";
import {
  PullRequest,
  PullRequestState,
} from "@sweetr/graphql-types/frontend/graphql";
import {
  parseISO,
  formatRelative,
  formatDistanceToNow,
  format,
} from "date-fns";
import {
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

  const formatDate = (date: Date, type: "relative" | "ago") => {
    if (type === "ago") {
      return formatDistanceToNow(date, {
        addSuffix: true,
      });
    }

    return formatRelative(date, new Date());
  };

  const getTimeTooltipLabel = (date: Date) => {
    return `${format(date, "MMMM do, yyyy")} at ${format(date, "hh:mm a")} (${getTimezoneGmtLabel()})`;
  };

  const getTimeLabel = (type: "relative" | "ago") => {
    if (mergedAt) {
      return {
        timeLabel: `Merged ${formatDate(mergedAt, type)}`,
        timeTooltipLabel: getTimeTooltipLabel(mergedAt),
      };
    }

    if (closedAt) {
      return {
        timeLabel: `Closed ${formatDate(closedAt, type)}`,
        timeTooltipLabel: getTimeTooltipLabel(closedAt),
      };
    }

    if (pullRequest.state === PullRequestState.DRAFT) {
      return {
        timeLabel: `Drafted ${formatDate(createdAt, type)}`,
        timeTooltipLabel: getTimeTooltipLabel(createdAt),
      };
    }

    return {
      timeLabel: `Opened ${formatDate(createdAt, type)}`,
      timeTooltipLabel: getTimeTooltipLabel(createdAt),
    };
  };

  return {
    getCommentFlameProps,
    getTimeLabel,
  };
};
