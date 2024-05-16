import { ThemeIcon, Tooltip } from "@mantine/core";
import { IconEyeStar } from "@tabler/icons-react";
import { humanizeDuration, msToHour } from "../../providers/date.provider";

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
          )} after PR was opened`}
          withArrow
          position="right"
        >
          <ThemeIcon
            size="md"
            variant="default"
            c={getFirstReviewColor(timeInHours)}
          >
            <IconEyeStar size={20} stroke={1.5} />{" "}
          </ThemeIcon>
        </Tooltip>
      }
    </>
  );
};

const getFirstReviewColor = (durationInHours: number) => {
  if (durationInHours < 2) return "green.5";

  return "dark.1";
};
