import {
  PullRequest,
  PullRequestState,
} from "@sweetr/graphql-types/frontend/graphql";
import {
  IconProps,
  IconGitMerge,
  IconClock,
  IconEyeCheck,
  IconEyeX,
  IconSquareRoundedCheck,
  IconSquareRoundedX,
} from "@tabler/icons-react";
import React from "react";
import { msToHour } from "../../providers/date.provider";
import { isBefore, parseISO, subDays } from "date-fns";
import { IconDeployment } from "../../providers/icon.provider";
import { isNumber } from "radash";

type Variant = "success" | "warning" | "error" | "default";

export type BadgeData = null | {
  variant: Variant;
  label: string;
  icon: React.ComponentType<IconProps>;
};

export const useBadges = (
  pullRequest: Pick<
    PullRequest,
    "state" | "tracking" | "createdAt" | "mergedAt" | "closedAt"
  >,
) => {
  const badges: Record<string, BadgeData> = {
    staleDraft: getStaleDraftBadge(pullRequest),
    reviewed: getReviewBadge(pullRequest),
    approved: getApprovalBadge(pullRequest),
    merged: getMergeBadge(pullRequest),
    deployed: getDeployBadge(pullRequest),
  };

  const getCardColor = () => {
    const hasBadgeOf = (type: string) =>
      Object.values(badges).some((badge) => badge?.variant === type);

    if (hasBadgeOf("error")) {
      return {
        start: "var(--mantine-color-red-5)",
        end: "var(--mantine-color-pink-5)",
      };
    }

    return null;
  };

  return {
    getCardColor,
    badges,
  };
};

const getReviewBadge = (
  pullRequest: Pick<PullRequest, "state" | "tracking">,
) => {
  if ([PullRequestState.CLOSED].includes(pullRequest.state)) {
    return null;
  }

  const hasReviews = !!pullRequest.tracking.firstReviewAt;

  const getVariant = (): Variant => {
    const timeToFirstReview = pullRequest.tracking.timeToFirstReview;
    const hasReviews = !!pullRequest.tracking.firstReviewAt;

    if (!timeToFirstReview) return "default";

    const hoursToFirstReview = timeToFirstReview / msToHour;

    if (hoursToFirstReview >= 48) return "error";

    if (hoursToFirstReview >= 24) return "warning";

    if (hasReviews && hoursToFirstReview <= 2) return "success";

    return "default";
  };

  const variant = getVariant();

  const getLabel = () => {
    if (hasReviews) return "Reviewed";

    if (variant === "error") return "Stuck on review";

    return "Not reviewed";
  };

  return {
    variant,
    label: getLabel(),
    icon: hasReviews ? IconEyeCheck : IconEyeX,
  };
};

const getApprovalBadge = (
  pullRequest: Pick<PullRequest, "state" | "tracking" | "mergedAt">,
) => {
  if (
    [PullRequestState.CLOSED, PullRequestState.DRAFT].includes(
      pullRequest.state,
    )
  ) {
    return null;
  }

  const isApproved = !!pullRequest.tracking.firstApprovalAt;
  const isMerged = !!pullRequest.mergedAt;
  if (!isApproved && isMerged)
    return {
      variant: "error" as Variant,
      label: "Merged without approval",
      icon: IconSquareRoundedX,
    };

  const getVariant = (): Variant => {
    const timeToFirstApproval = pullRequest.tracking.timeToFirstApproval;

    if (!timeToFirstApproval) return "warning";

    const hoursToFirstApproval = timeToFirstApproval / msToHour;

    if (hoursToFirstApproval >= 48) return "error";

    if (hoursToFirstApproval >= 24) return "warning";

    if (isApproved && hoursToFirstApproval <= 2) return "success";

    return "default";
  };

  return {
    variant: getVariant(),
    label: isApproved ? "Approved" : "Not approved",
    icon: isApproved ? IconSquareRoundedCheck : IconSquareRoundedX,
  };
};

const getMergeBadge = (
  pullRequest: Pick<PullRequest, "state" | "tracking" | "mergedAt">,
) => {
  if (
    ![PullRequestState.OPEN, PullRequestState.MERGED].includes(
      pullRequest.state,
    )
  )
    return null;

  const isApproved = !!pullRequest.tracking.firstApprovalAt;
  const isMerged = !!pullRequest.mergedAt;
  const timeToMerge = pullRequest.tracking.timeToMerge;

  if (!timeToMerge || !isApproved) return null;

  const hoursToMerge = timeToMerge / msToHour;

  if (hoursToMerge <= 24) return null;

  return {
    variant: "error" as Variant,
    label: isMerged ? "Slow merge" : "Stuck on merge",
    icon: IconGitMerge,
  };
};

const getDeployBadge = (
  pullRequest: Pick<PullRequest, "state" | "tracking">,
) => {
  if (pullRequest.state !== PullRequestState.MERGED) return null;

  const isDeployed = !!pullRequest.tracking.firstDeployedAt;
  const timeToDeploy = pullRequest.tracking.timeToDeploy;

  if (!isNumber(timeToDeploy)) return null; // Only nullish when PR is closed

  const getVariant = (): Variant => {
    const hoursToDeploy = timeToDeploy / msToHour;

    if (hoursToDeploy >= 48) return "error";

    if (hoursToDeploy >= 24) return "warning";

    if (hoursToDeploy <= 2) return "success";

    return "default";
  };

  const variant = getVariant();

  const getLabel = () => {
    if (isDeployed) return "Deployed";

    if (variant === "error") return "Stuck on deploy";

    return "Not deployed";
  };

  return {
    variant,
    label: getLabel(),
    icon: IconDeployment,
  };
};

const getStaleDraftBadge = (
  pullRequest: Pick<PullRequest, "state" | "createdAt">,
) => {
  if (pullRequest.state !== PullRequestState.DRAFT) return null;

  const isStale = isBefore(
    parseISO(pullRequest.createdAt),
    subDays(new Date(), 7),
  );

  if (!isStale) return null;

  return {
    variant: "error" as Variant,
    label: "Stale",
    icon: IconClock,
  };
};
