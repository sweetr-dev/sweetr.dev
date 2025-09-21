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
import { IconServer } from "@tabler/icons-react";
import { parseISO } from "date-fns";
import { formatLocaleDate } from "../../../../../providers/date.provider";
import { Link } from "react-router-dom";
import { Application } from "@sweetr/graphql-types/frontend/graphql";
import { useFilterSearchParameters } from "../../../../../providers/filter.provider";

interface CardApplicationProps {
  application: Application & {
    lastDeployment?: {
      version: string;
      deployedAt: string;
    };
  };
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
      to={`/systems/applications/${application.id}/?${searchParams.toString()}`}
      underline="never"
      c="dark.0"
      className="subgrid"
      data-columns="4"
    >
      <Paper
        p="md"
        pl="lg"
        radius="md"
        withBorder
        className={`grow-on-hover subgrid`}
        data-columns="4"
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

        <Tooltip label="Production" withArrow>
          <Group gap={5}>
            <IconServer stroke={1.5} size={20} />
            {!application.lastDeployment && <Text>No deployments</Text>}
            {application.lastDeployment && (
              <Text>
                Running{" "}
                <Anchor>
                  {formatVersion(application.lastDeployment.version)}
                </Anchor>{" "}
                since{" "}
                {formatLocaleDate(
                  parseISO(application.lastDeployment.deployedAt),
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </Text>
            )}
          </Group>
        </Tooltip>
      </Paper>
    </Anchor>
  );
};
