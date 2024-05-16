import { ThemeIcon, Tooltip } from "@mantine/core";
import { IconEyeCheck } from "@tabler/icons-react";
import { humanizeDuration, msToHour } from "../../providers/date.provider";

interface BadgeApprovalTimeProps {
  timeToFirstApproval?: number;
}

export const BadgeApprovalTime = ({
  timeToFirstApproval,
}: BadgeApprovalTimeProps) => {
  const hasReview = timeToFirstApproval !== undefined;

  if (!hasReview) return null;

  const label =
    timeToFirstApproval === 0
      ? `Approved on first review`
      : `${humanizeDuration(timeToFirstApproval)} to approval`;

  return (
    <Tooltip label={label} withArrow position="right">
      <ThemeIcon
        size="md"
        variant="default"
        c={getFirstReviewColor(timeToFirstApproval / msToHour)}
      >
        <IconEyeCheck size={20} stroke={1.5} />{" "}
      </ThemeIcon>
    </Tooltip>
  );
};

const getFirstReviewColor = (durationInHours: number) => {
  if (durationInHours < 1) return "green.5";

  if (durationInHours < 24) return "dark.1";

  if (durationInHours < 48) return "yellow.6";

  return "red.9";
};
