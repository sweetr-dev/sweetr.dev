import {
  Anchor,
  Badge,
  Box,
  Code,
  Group,
  Paper,
  Text,
  Tooltip,
} from "@mantine/core";
import { Application } from "@sweetr/graphql-types/frontend/graphql";
import { IconServer } from "@tabler/icons-react";
import { parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { formatLocaleDate } from "../../../../../providers/date.provider";
import { useFilterSearchParameters } from "../../../../../providers/filter.provider";
import { getGithubCommitOrTagUrl } from "../../../../../providers/github.provider";
import { MenuApplication } from "./menu-application";

interface CardApplicationProps {
  application: Application;
}

export const CardApplication = ({ application }: CardApplicationProps) => {
  const searchParams = useFilterSearchParameters();

  const formatVersion = (version: string) => {
    if (version.includes(".") || version.startsWith("v")) return version;

    return version.substring(0, 7);
  };

  return (
    <Anchor
      component={Link}
      to={`/systems/applications/edit/${application.id}?${searchParams.toString()}`}
      underline="never"
      c="dark.0"
      className="subgrid grow-on-hover"
      data-columns="7"
    >
      <Paper
        pl="lg"
        pr="md"
        radius="md"
        withBorder
        className={`subgrid items-center`}
        data-columns="5"
      >
        <Box>
          <Code variant="default" c="white" fz="sm">
            {application.name}
          </Code>
        </Box>

        <Tooltip label={application.description} withArrow>
          <Text lineClamp={1} maw={250}>
            {application.description}
          </Text>
        </Tooltip>

        {application.team && (
          <Text>
            {application.team?.icon} {application.team?.name}
          </Text>
        )}
        {!application.team && (
          <Badge size="sm" color="dark">
            Unassigned
          </Badge>
        )}

        <Group gap={5}>
          <IconServer stroke={1.5} size={20} />
          {!application.lastProductionDeployment && <Text>No deployments</Text>}
          {application.lastProductionDeployment && (
            <Tooltip
              withArrow
              label={`In production since ${formatLocaleDate(
                parseISO(application.lastProductionDeployment.deployedAt),
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}`}
            >
              <Box>
                <Text display="inline">Running </Text>
                <Box
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      getGithubCommitOrTagUrl(
                        application.repository.fullName,
                        application.lastProductionDeployment!.version,
                      ),
                      "_blank",
                    );
                  }}
                  className="link"
                >
                  {formatVersion(application.lastProductionDeployment.version)}
                </Box>
              </Box>
            </Tooltip>
          )}
        </Group>

        <MenuApplication application={application} />
      </Paper>
    </Anchor>
  );
};
