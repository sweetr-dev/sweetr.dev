import { Tooltip } from "@mantine/core";
import { IconEyeStar } from "@tabler/icons-react";
import { humanizeDuration, msToHour } from "../../providers/date.provider";
import { BadgeStatus } from "./badge-status";

interface BadgeFirstReviewProps {
  timeToFirstReview: number;
}

export const BadgeFirstReview = ({
  timeToFirstReview,
}: BadgeFirstReviewProps) => {
  const timeInHours = timeToFirstReview / msToHour;

  return (
    <>
      {
        <Tooltip
          label={`First to review: ${humanizeDuration(
            timeToFirstReview,
          )} after PR was ready`}
          withArrow
          position="right"
        >
          <div>
            <BadgeStatus
              icon={IconEyeStar}
              variant={getFirstReviewColor(timeInHours)}
            >
              First to review
            </BadgeStatus>
          </div>
        </Tooltip>
      }
    </>
  );
};

const getFirstReviewColor = (durationInHours: number) => {
  if (durationInHours < 2) return "success";

  return "default";
};
