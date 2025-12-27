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
import { Deployment } from "@sweetr/graphql-types/frontend/graphql";
import { IconCalendarFilled, IconQuestionMark } from "@tabler/icons-react";
import { parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { AvatarUser } from "../../../../../components/avatar-user";
import { formatLocaleDate } from "../../../../../providers/date.provider";
import { formatDeploymentVersion } from "../../../../../providers/deployment.provider";
import { useFilterSearchParameters } from "../../../../../providers/filter.provider";
import { IconPullRequest } from "../../../../../providers/icon.provider";
import { MenuDeployment } from "./menu-deployment";

interface CardDeploymentProps {
  deployment: Deployment;
}

export const CardDeployment = ({ deployment }: CardDeploymentProps) => {
  const searchParams = useFilterSearchParameters();
  return (
    <Anchor
      component={Link}
      to={`/systems/deployments/view/${deployment.id}?${searchParams.toString()}`}
      underline="never"
      c="dark.0"
      className="subgrid"
      data-columns="7"
    >
      <Paper
        px="md"
        mih={60}
        radius="md"
        withBorder
        className={`grow-on-hover subgrid items-center`}
        data-columns="7"
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
          <Text>{deployment.pullRequestCount}</Text>
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
        <MenuDeployment deployment={deployment} />
      </Paper>
    </Anchor>
  );
};
