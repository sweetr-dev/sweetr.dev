import { ThemeIcon, Tooltip } from "@mantine/core";
import {
  IconEye,
  IconEyeCheck,
  IconEyeOff,
  IconEyeQuestion,
} from "@tabler/icons-react";
import { humanizeDuration, msToHour } from "../../providers/date.provider";

interface BadgeCodeReviewTimeProps {
  timeToFirstReview?: number;
  mergedAt?: Date;
  firstReviewAt?: Date;
  timeToFirstApproval?: number;
}

export const BadgeCodeReviewTime = ({
  mergedAt,
  firstReviewAt,
  timeToFirstReview,
  timeToFirstApproval,
}: BadgeCodeReviewTimeProps) => {
  const isWaitingForReview = !firstReviewAt && !mergedAt;
  const mergedWithoutApproval = !timeToFirstApproval && mergedAt;

  const Icon = (() => {
    if (timeToFirstApproval) return IconEyeCheck;

    if (mergedWithoutApproval) return IconEyeOff;

    if (firstReviewAt) return IconEye;

    return IconEyeQuestion;
  })();

  const getLabel = () => {
    if (mergedWithoutApproval) return "Merged without approval";

    if (timeToFirstApproval && timeToFirstApproval === timeToFirstReview) {
      return `Reviewed and approved in ${humanizeDuration(timeToFirstReview)}`;
    }

    if (!timeToFirstReview) return;

    if (timeToFirstApproval)
      return `First reviewed in ${humanizeDuration(
        timeToFirstReview!,
      )}, approved in ${humanizeDuration(timeToFirstApproval)}`;

    if (isWaitingForReview)
      return `Waiting for review for ${humanizeDuration(timeToFirstReview)}`;

    return `First reviewed in ${humanizeDuration(timeToFirstReview)}`;
  };

  const getIconColor = () => {
    if (mergedWithoutApproval) return "dark.9";

    if (!timeToFirstReview) return;

    const hoursToFirstReview = timeToFirstReview / msToHour;
    const hoursToApprove = timeToFirstApproval
      ? timeToFirstApproval / msToHour
      : undefined;

    if (hoursToFirstReview >= 48 || (hoursToApprove && hoursToApprove >= 48))
      return "dark.9";

    if (hoursToFirstReview >= 24 || (hoursToApprove && hoursToApprove >= 24))
      return "yellow.6";

    if (hoursToFirstReview >= 2 && (!hoursToApprove || hoursToApprove >= 2))
      return "dark.1";

    if (!timeToFirstApproval) return "dark.1";

    return "green.5";
  };

  const color = getIconColor();
  return (
    <>
      <Tooltip label={getLabel()} withArrow position="right">
        <ThemeIcon
          size="md"
          color="red.7"
          variant={color === "dark.9" ? "filled" : "default"}
          c={getIconColor()}
          style={
            color === "dark.9"
              ? { boxShadow: "0 0 10px var(--mantine-color-red-5)" }
              : {}
          }
        >
          <Icon size={20} stroke={1.5} />
        </ThemeIcon>
      </Tooltip>
    </>
  );
};
