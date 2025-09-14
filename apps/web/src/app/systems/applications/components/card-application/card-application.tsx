import { Anchor, Box, Code, Group, Paper, Text, Tooltip } from "@mantine/core";
import { IconServer } from "@tabler/icons-react";
import { parseISO } from "date-fns";
import { formatLocaleDate } from "../../../../../providers/date.provider";

type Application = {
  name: string;
  repository: {
    name: string;
  };
  team: {
    name: string;
    icon: string;
  };
  lastDeployment: {
    version: string;
    deployedAt: string;
  };
};

export const CardApplication = ({
  application,
}: {
  application: Application;
}) => {
  const formatVersion = (version: string) => {
    if (version.includes(".") || version.startsWith("v")) return version;

    return version.substring(0, 7);
  };

  return (
    <Anchor
      href={`/systems/applications/${application.name}`}
      underline="never"
      c="dark.0"
      target="_blank"
      className="subgrid"
      data-columns="3"
    >
      <Paper
        p="md"
        pl="lg"
        radius="md"
        withBorder
        className={`grow-on-hover subgrid`}
        data-columns="3"
      >
        <Box>
          <Code variant="default" c="white" fz="sm">
            {application.name}
          </Code>
        </Box>

        <Text>
          {application.team.icon} {application.team.name}
        </Text>

        <Tooltip label="Production" withArrow>
          <Group gap={5}>
            <IconServer stroke={1.5} size={20} />
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
          </Group>
        </Tooltip>
      </Paper>
    </Anchor>
  );
};
