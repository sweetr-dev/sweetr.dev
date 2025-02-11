import { useMantineTheme } from "@mantine/core";
import {
  PullRequest,
  PullRequestState,
} from "@sweetr/graphql-types/frontend/graphql";
import { parseISO, formatRelative } from "date-fns";
import { parseNullableISO } from "../../providers/date.provider";

export const usePrCard = (pullRequest: PullRequest) => {
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

  const getTimeLabel = () => {
    const openedAtLabel = `Opened ${formatRelative(createdAt, new Date())}`;

    if (mergedAt) return `Merged ${formatRelative(mergedAt, new Date())}`;

    if (closedAt) return `Closed ${formatRelative(closedAt, new Date())}`;

    if (pullRequest.state === PullRequestState.DRAFT)
      return `Drafted ${formatRelative(createdAt, new Date())}`;
    return openedAtLabel;
  };

  return {
    getCommentFlameProps,
    getTimeLabel,
  };
};
