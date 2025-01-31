import { ThemeIcon, Tooltip } from "@mantine/core";
import { IconGitMerge, IconGitPullRequest } from "@tabler/icons-react";
import { humanizeDuration, msToHour } from "../../providers/date.provider";

interface BadgeMergeTimeProps {
  mergedAt?: Date;
  timeToMerge: number;
}

export const BadgeMergeTime = ({
  mergedAt,
  timeToMerge,
}: BadgeMergeTimeProps) => {
  const hasMerged = !!mergedAt;

  const getLabel = () => {
    const duration = humanizeDuration(timeToMerge);

    if (hasMerged) return `Merged in ${duration}`;

    return `Open for ${duration}`;
  };

  const color = getMergeColor(timeToMerge / msToHour, mergedAt);

  return (
    <Tooltip label={getLabel()} withArrow position="right">
      <ThemeIcon
        size="md"
        color="red.7"
        variant={color === "dark.9" ? "filled" : "default"}
        c={color}
        style={
          color === "dark.9"
            ? { boxShadow: "0 0 10px var(--mantine-color-red-5)" }
            : {}
        }
      >
        {hasMerged && <IconGitMerge size={20} stroke={1.5} />}
        {!hasMerged && <IconGitPullRequest size={20} stroke={1.5} />}
      </ThemeIcon>
    </Tooltip>
  );
};

const getMergeColor = (durationInHours: number, mergedAt?: Date) => {
  if (durationInHours < 3 && mergedAt) return "green.5";

  if (durationInHours < 24 * 5) return "dark.1";

  return "dark.9";
};
