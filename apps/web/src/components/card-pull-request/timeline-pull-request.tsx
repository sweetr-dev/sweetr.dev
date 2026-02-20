import {
  Box,
  Button,
  Divider,
  Group,
  Text,
  ThemeIcon,
  Timeline,
  Tooltip,
} from "@mantine/core";
import {
  PullRequest,
  PullRequestState,
} from "@sweetr/graphql-types/frontend/graphql";
import {
  IconClock,
  IconCode,
  IconEyeCode,
  IconGitMerge,
  IconInfoCircle,
  IconSquareRoundedCheck,
} from "@tabler/icons-react";
import { humanizeDuration, msToHour } from "../../providers/date.provider";
import { useBadges } from "./use-badges";
import { isNumber } from "radash";
import { IconDeployment } from "../../providers/icon.provider";
import { useFeatureAdoption } from "../../providers/feature-adoption.provider";
import { Link } from "react-router-dom";

interface TimeLinePullRequestProps {
  pullRequest: Pick<
    PullRequest,
    "state" | "tracking" | "createdAt" | "mergedAt"
  >;
}

export const TimelinePullRequest = ({
  pullRequest,
}: TimeLinePullRequestProps) => {
  const { triedDeployments } = useFeatureAdoption();
  const successColor = "var(--mantine-color-green-4)";
  const errorColor = "var(--mantine-color-red-4)";
  const warningColor = "var(--mantine-color-yellow-4)";

  const isClosed = pullRequest.state === PullRequestState.CLOSED;
  const isDraft = pullRequest.state === PullRequestState.DRAFT;
  const isMerged = !!pullRequest.mergedAt;
  const isDeployed = !!pullRequest.tracking.firstDeployedAt;
  const isDone = isMerged || isClosed || isDeployed;
  const hasReviews = !!pullRequest.tracking.firstReviewAt;
  const isApproved = !!pullRequest.tracking.firstApprovalAt;

  const timeToCode = pullRequest.tracking.timeToCode;
  const timeToFirstReview = pullRequest.tracking.timeToFirstReview;
  const timeToFirstApproval = pullRequest.tracking.timeToFirstApproval;
  const timeToMerge = pullRequest.tracking.timeToMerge;
  const timeToDeploy = pullRequest.tracking.timeToDeploy;
  const cycleTime = pullRequest.tracking.cycleTime;

  const { badges } = useBadges(pullRequest);

  const getStrokeLevel = (level: number) => {
    if (isDone && level < 4) return "solid";
    if (isApproved && level < 3) return "solid";
    if (hasReviews && level < 2) return "solid";

    return "dashed";
  };

  const getColor = (
    level: "coding" | "review" | "approval" | "merge" | "deploy",
  ) => {
    if (level === "coding") {
      if (badges.staleDraft?.variant === "error") return errorColor;

      return "var(--mantine-color-text)";
    }

    if (level === "review") {
      if (badges.reviewed?.variant === "success") return successColor;
      if (badges.reviewed?.variant === "error") return errorColor;
      if (badges.reviewed?.variant === "warning") return warningColor;

      return hasReviews
        ? "var(--mantine-color-text)"
        : "var(--mantine-color-dark-3)";
    }

    if (level === "approval") {
      if (badges.approved?.variant === "success") return successColor;
      if (badges.approved?.variant === "error") return errorColor;
      if (badges.approved?.variant === "warning") return warningColor;

      const isMergedWithoutApproval = !isApproved && isMerged;
      if (isMergedWithoutApproval) return errorColor;

      return isApproved
        ? "var(--mantine-color-text)"
        : "var(--mantine-color-dark-3)";
    }

    if (level === "merge") {
      if (badges.merged?.variant === "success") return successColor;
      if (badges.merged?.variant === "error") return errorColor;
      if (badges.merged?.variant === "warning") return warningColor;

      if (isMerged && timeToMerge) {
        const hoursToMerge = timeToMerge / msToHour;

        if (hoursToMerge <= 2) return successColor;
      }

      return isDone
        ? "var(--mantine-color-text)"
        : "var(--mantine-color-dark-3)";
    }

    if (level === "deploy") {
      if (badges.deployed?.variant === "success") return successColor;
      if (badges.deployed?.variant === "error") return errorColor;
      if (badges.deployed?.variant === "warning") return warningColor;
    }

    return "var(--mantine-color-dark-3)";
  };

  return (
    <>
      <Box p="md">
        <Timeline bulletSize={28} lineWidth={1} color="dark.3" active={4}>
          {!isDraft && (
            <Timeline.Item
              lineVariant="solid"
              bullet={
                <ThemeIcon variant="filled" color="dark.7">
                  <IconCode
                    size={20}
                    stroke={1.5}
                    color="var(--mantine-color-text)"
                  />
                </ThemeIcon>
              }
              title={
                <Group align="center" gap={5}>
                  Coding
                  <Tooltip
                    withArrow
                    label="Time between first commit and opening the PR"
                  >
                    <IconInfoCircle stroke={1.5} size={16} />
                  </Tooltip>
                </Group>
              }
              c="var(--mantine-color-text)"
            >
              <Text size="xs" mt={5}>
                {isNumber(timeToCode) && <>{humanizeDuration(timeToCode)}</>}
              </Text>
            </Timeline.Item>
          )}

          <Timeline.Item
            lineVariant={getStrokeLevel(2)}
            bullet={
              <ThemeIcon variant="filled" color="dark.7">
                <IconEyeCode
                  size={20}
                  stroke={1.5}
                  color={getColor("review")}
                />
              </ThemeIcon>
            }
            title={hasReviews ? "First reviewed" : "First review"}
            c={getColor("review")}
          >
            <Text size="xs" mt={5}>
              {hasReviews && isNumber(timeToFirstReview) && (
                <>in {humanizeDuration(timeToFirstReview)}</>
              )}
              {!hasReviews && isNumber(timeToFirstReview) && (
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
                  color={getColor("approval")}
                />
              </ThemeIcon>
            }
            c={getColor("approval")}
          >
            <Text size="xs" mt={5}>
              {isApproved && isNumber(timeToFirstApproval) && (
                <>in {humanizeDuration(timeToFirstApproval)}</>
              )}
              {!isApproved && isNumber(timeToFirstApproval) && (
                <>pending for {humanizeDuration(timeToFirstApproval)}</>
              )}
              {!isApproved && isDone && <>skipped</>}
            </Text>
          </Timeline.Item>

          <Timeline.Item
            title={isClosed ? "Closed" : isMerged ? "Merged" : "Merge"}
            bullet={
              <ThemeIcon variant="filled" color="dark.7">
                <IconGitMerge
                  size={20}
                  stroke={1.5}
                  color={getColor("merge")}
                />
              </ThemeIcon>
            }
            c={getColor("merge")}
          >
            <Text size="xs" mt={5}>
              {isMerged && isNumber(timeToMerge) && (
                <>in {humanizeDuration(timeToMerge)}</>
              )}

              {!isMerged && isNumber(timeToMerge) && (
                <>pending for {humanizeDuration(timeToMerge)}</>
              )}
            </Text>
          </Timeline.Item>

          {!isClosed && (
            <Timeline.Item
              title={isDeployed ? "Deployed" : "Deploy"}
              bullet={
                <ThemeIcon variant="filled" color="dark.7">
                  <IconDeployment
                    size={20}
                    stroke={1.5}
                    color={
                      triedDeployments
                        ? getColor("deploy")
                        : "var(--mantine-color-violet-4)"
                    }
                  />
                </ThemeIcon>
              }
              c={triedDeployments ? getColor("deploy") : "violet"}
            >
              {triedDeployments && (
                <Text size="xs" mt={5}>
                  {isDeployed && isNumber(timeToDeploy) && (
                    <>in {humanizeDuration(timeToDeploy)}</>
                  )}

                  {!isDeployed && isNumber(timeToDeploy) && (
                    <>pending for {humanizeDuration(timeToDeploy)}</>
                  )}
                </Text>
              )}

              {!triedDeployments && (
                <>
                  <Button
                    color="violet"
                    size="xs"
                    variant="outline"
                    mt={5}
                    component={Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    to="https://docs.sweetr.dev/features/deployments"
                  >
                    Setup Deployments
                  </Button>
                </>
              )}
            </Timeline.Item>
          )}
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
                    <IconClock
                      size={20}
                      stroke={1.5}
                      color="var(--mantine-color-text)"
                    />
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
