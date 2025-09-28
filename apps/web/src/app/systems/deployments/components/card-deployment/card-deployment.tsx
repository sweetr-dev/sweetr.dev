import {
  Anchor,
  Avatar,
  Badge,
  Box,
  Code,
  Group,
  Paper,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCalendarFilled, IconQuestionMark } from "@tabler/icons-react";
import { parseISO } from "date-fns";
import { formatLocaleDate } from "../../../../../providers/date.provider";
import { Deployment } from "@sweetr/graphql-types/frontend/graphql";
import { IconPullRequest } from "../../../../../providers/icon.provider";
import { AvatarUser } from "../../../../../components/avatar-user";
import { formatDeploymentVersion } from "../../../../../providers/deployment.provider";

interface CardDeploymentProps {
  deployment: Deployment;
}

export const CardDeployment = ({ deployment }: CardDeploymentProps) => {
  return (
    <Anchor
      href={`/systems/deployments/${deployment.id}`}
      underline="never"
      c="dark.0"
      target="_blank"
      className="subgrid"
      data-columns="6"
    >
      <Paper
        p="md"
        pl="lg"
        radius="md"
        withBorder
        className={`grow-on-hover subgrid`}
        data-columns="6"
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
        <Text lineClamp={1}>{formatDeploymentVersion(deployment.version)}</Text>
        <Group gap={5}>
          <IconPullRequest stroke={1.5} size={20} />
          <Text>5</Text>
        </Group>

        <Box>
          {deployment.author && (
            <AvatarUser
              name={deployment.author.name}
              src={deployment.author.avatar}
              size="sm"
              tooltip={`Deployed by: ${deployment.author.name}`}
            />
          )}
          {!deployment.author && (
            <Tooltip label="Deployed by: unknown">
              <Avatar size="sm">
                <IconQuestionMark stroke={1.5} size={16} />
              </Avatar>
            </Tooltip>
          )}
        </Box>
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
