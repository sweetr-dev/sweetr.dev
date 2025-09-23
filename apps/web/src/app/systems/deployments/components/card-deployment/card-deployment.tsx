import { Anchor, Badge, Box, Code, Group, Paper, Text } from "@mantine/core";
import { IconCalendarFilled, IconGitPullRequest } from "@tabler/icons-react";
import { parseISO } from "date-fns";
import { formatLocaleDate } from "../../../../../providers/date.provider";
import { Deployment } from "@sweetr/graphql-types/frontend/graphql";

interface CardDeploymentProps {
  deployment: Deployment;
}

export const CardDeployment = ({ deployment }: CardDeploymentProps) => {
  const formatVersion = (version: string) => {
    if (version.includes(".") || version.startsWith("v")) return version;

    return version.substring(0, 7);
  };

  return (
    <Anchor
      href={`/systems/deployments/${deployment.id}`}
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
          <Text>5</Text>
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
