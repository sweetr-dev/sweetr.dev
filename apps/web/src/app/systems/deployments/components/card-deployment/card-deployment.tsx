import { Anchor, Badge, Box, Code, Group, Paper, Text } from "@mantine/core";
import { IconCalendarFilled, IconGitPullRequest } from "@tabler/icons-react";
import { parseISO } from "date-fns";
import { formatLocaleDate } from "../../../../../providers/date.provider";

type Deployment = {
  application: {
    name: string;
  };
  version: string;
  environment: {
    name: string;
    isProduction: boolean;
  };
  deployedAt: string;
  pullRequests: {
    id: string;
    title: string;
  }[];
};

export const CardDeployment = ({ deployment }: { deployment: Deployment }) => {
  const formatVersion = (version: string) => {
    if (version.includes(".") || version.startsWith("v")) return version;

    return version.substring(0, 7);
  };

  return (
    <Anchor
      href={`/systems/deployments/1`}
      underline="never"
      c="dark.0"
      target="_blank"
      className="subgrid"
      data-columns="5"
    >
      <Paper
        p="md"
        pl="lg"
        radius="md"
        withBorder
        className={`grow-on-hover subgrid`}
        data-columns="5"
      >
        <Group gap={5}>
          <IconCalendarFilled stroke={1.5} size={20} />
          <Text>
            {formatLocaleDate(parseISO(deployment.deployedAt), {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </Group>
        <Box>
          <Code variant="default" c="white" fz="sm">
            {deployment.application.name}
          </Code>
        </Box>
        <Text lineClamp={1}>{formatVersion(deployment.version)}</Text>
        <Group gap={5}>
          <IconGitPullRequest stroke={1.5} size={20} />
          <Text>{deployment.pullRequests.length}</Text>
        </Group>
        <Badge
          variant="light"
          color={deployment.environment.isProduction ? "green" : "gray"}
        >
          {deployment.environment.name}
        </Badge>
      </Paper>
    </Anchor>
  );
};
