import { Badge, Tooltip } from "@mantine/core";
import { PullRequestSize } from "@sweetr/graphql-types/frontend/graphql";
import { ReactElement } from "react";

interface BadgePullRequestSizeProps {
  size: PullRequestSize;
  tooltip?: ReactElement;
}

export const BadgePullRequestSize = ({
  size,
  tooltip,
}: BadgePullRequestSizeProps) => {
  return (
    <Tooltip
      label={tooltip}
      position="top"
      disabled={!tooltip}
      arrowSize={8}
      bg="dark.7"
      style={{ border: "1px solid var(--mantine-color-dark-4)" }}
    >
      <Badge c={getSizeColor(size)} variant="default" miw={72}>
        {size}
      </Badge>
    </Tooltip>
  );
};

const getSizeColor = (size: PullRequestSize) => {
  if (size === PullRequestSize.TINY) return "green";
  if (size === PullRequestSize.SMALL) return "green";
  if (size === PullRequestSize.MEDIUM) return "dark.1";
  if (size === PullRequestSize.LARGE) return "red";

  return "red";
};
