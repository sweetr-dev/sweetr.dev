import { Box, Divider, Text, ThemeIcon, Timeline } from "@mantine/core";
import {
  PullRequest,
  PullRequestState,
} from "@sweetr/graphql-types/frontend/graphql";
import {
  IconClock,
  IconEyeCode,
  IconGitMerge,
  IconSquareRoundedCheck,
} from "@tabler/icons-react";
import { humanizeDuration, msToHour } from "../../providers/date.provider";
import { useBadges } from "./use-badges";

interface TimeLinePullRequestProps {
  pullRequest: Pick<
    PullRequest,
    "state" | "tracking" | "createdAt" | "mergedAt"
  >;
}

export const TimelinePullRequest = ({
  pullRequest,
}: TimeLinePullRequestProps) => {
  const successColor = "var(--mantine-color-green-4)";
  const errorColor = "var(--mantine-color-red-4)";
  const warningColor = "var(--mantine-color-yellow-4)";

  const isClosed = pullRequest.state === PullRequestState.CLOSED;
  const isMerged = !!pullRequest.mergedAt;
  const isDone = isMerged || isClosed;
  const hasReviews = !!pullRequest.tracking.firstReviewAt;
  const isApproved = !!pullRequest.tracking.firstApprovalAt;

  const timeToFirstReview = pullRequest.tracking.timeToFirstReview;
  const timeToFirstApproval = pullRequest.tracking.timeToFirstApproval;
  const timeToMerge = pullRequest.tracking.timeToMerge;
  const cycleTime = pullRequest.tracking.cycleTime;

  const { badges } = useBadges(pullRequest);

  const getStrokeLevel = (level: number) => {
    if (isDone && level < 4) return "solid";
    if (isApproved && level < 3) return "solid";
    if (hasReviews && level < 2) return "solid";

    return "dashed";
  };

  const getColor = (level: number) => {
    if (level === 1) {
      if (badges.staleDraft?.variant === "error") return errorColor;

      return "var(--mantine-color-text)";
    }

    if (level === 2) {
      if (badges.reviewed?.variant === "success") return successColor;
      if (badges.reviewed?.variant === "error") return errorColor;
      if (badges.reviewed?.variant === "warning") return warningColor;

      return hasReviews
        ? "var(--mantine-color-text)"
        : "var(--mantine-color-dark-3)";
    }

    if (level === 3) {
      if (badges.approved?.variant === "success") return successColor;
      if (badges.approved?.variant === "error") return errorColor;
      if (badges.approved?.variant === "warning") return warningColor;

      const isMergedWithoutApproval = !isApproved && isMerged;
      if (isMergedWithoutApproval) return errorColor;

      return isApproved
        ? "var(--mantine-color-text)"
        : "var(--mantine-color-dark-3)";
    }

    if (badges.merged?.variant === "success") return successColor;
    if (badges.merged?.variant === "error") return errorColor;
    if (badges.merged?.variant === "warning") return warningColor;

    if (isMerged && timeToMerge) {
      const hoursToMerge = timeToMerge / msToHour;

      if (hoursToMerge <= 2) return successColor;
    }

    return isDone ? "var(--mantine-color-text)" : "var(--mantine-color-dark-3)";
  };

  return (
    <>
      <Box p="md">
        <Timeline bulletSize={28} lineWidth={1} color="dark.3" active={4}>
          <Timeline.Item
            lineVariant={getStrokeLevel(2)}
            bullet={
              <ThemeIcon variant="filled" color="dark.7">
                <IconEyeCode size={20} stroke={1.5} color={getColor(2)} />
              </ThemeIcon>
            }
            title={hasReviews ? "First reviewed" : "First review"}
            c={getColor(2)}
          >
            <Text size="xs" mt={5}>
              {hasReviews && timeToFirstReview && (
                <>in {humanizeDuration(timeToFirstReview)}</>
              )}
              {!hasReviews && timeToFirstReview && (
                <>pending for {humanizeDuration(timeToFirstReview)}</>
              )}
              {!hasReviews && isDone && <>skipped</>}
            </Text>
          </Timeline.Item>

          <Timeline.Item
            lineVariant={getStrokeLevel(3)}
            title={isApproved ? "Approved" : "Approval"}
            bullet={
              <ThemeIcon variant="filled" color="dark.7">
                <IconSquareRoundedCheck
                  size={20}
                  stroke={1.5}
                  color={getColor(3)}
                />
              </ThemeIcon>
            }
            c={getColor(3)}
          >
            <Text size="xs" mt={5}>
              {isApproved && timeToFirstApproval && (
                <>in {humanizeDuration(timeToFirstApproval)}</>
              )}
              {!isApproved && timeToFirstApproval && (
                <>pending for {humanizeDuration(timeToFirstApproval)}</>
              )}
              {!isApproved && isDone && <>skipped</>}
            </Text>
          </Timeline.Item>

          <Timeline.Item
            title={isClosed ? "Closed" : isMerged ? "Merged" : "Merge"}
            bullet={
              <ThemeIcon variant="filled" color="dark.7">
                <IconGitMerge size={20} stroke={1.5} color={getColor(4)} />
              </ThemeIcon>
            }
            c={getColor(4)}
          >
            <Text size="xs" mt={5}>
              {isMerged && timeToMerge && (
                <>in {humanizeDuration(timeToMerge)}</>
              )}

              {!isMerged && timeToMerge && (
                <>pending for {humanizeDuration(timeToMerge)}</>
              )}
            </Text>
          </Timeline.Item>
        </Timeline>
      </Box>
      {cycleTime && isMerged && (
        <>
          <Divider />
          <Box p="md">
            <Timeline bulletSize={28} lineWidth={1} color="dark.3" active={4}>
              <Timeline.Item
                bullet={
                  <ThemeIcon variant="filled" color="dark.7">
                    <IconClock size={20} stroke={1.5} color={getColor(1)} />
                  </ThemeIcon>
                }
                title="Cycle time"
              >
                <Text size="xs" mt={5}>
                  {humanizeDuration(cycleTime)}
                </Text>
              </Timeline.Item>
            </Timeline>
          </Box>
        </>
      )}
    </>
  );
};
