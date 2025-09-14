import { Anchor, Box, Code, Group, Paper, Text, Tooltip } from "@mantine/core";
import { IconCalendarFilled, IconFireExtinguisher } from "@tabler/icons-react";
import { AvatarUser } from "../../../../../components/avatar-user";
import {
  formatLocaleDate,
  formatMsDuration,
  humanizeDuration,
} from "../../../../../providers/date.provider";
import { differenceInMilliseconds, parseISO } from "date-fns";

type Incident = {
  fixDeployment: {
    application: {
      name: string;
    };
    version: string;
  };
  causeDeployment: {
    application: {
      name: string;
    };
    version: string;
  };
  leader: {
    name: string;
    avatar: string;
  };
  team: {
    name: string;
    icon: string;
  };
  detectedAt: string;
  resolvedAt: string;
};

export const CardIncident = ({ incident }: { incident: Incident }) => {
  const durationInMs = differenceInMilliseconds(
    parseISO(incident.resolvedAt),
    parseISO(incident.detectedAt),
  );

  return (
    <Anchor
      href={`/systems/incidents/1`}
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
            {formatLocaleDate(parseISO(incident.detectedAt), {
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
            {incident.causeDeployment.application.name}
          </Code>
        </Box>
        <Text>
          {incident.team.icon} {incident.team.name}
        </Text>
        <AvatarUser
          name={incident.leader.name}
          src={incident.leader.avatar}
          size={24}
          withTooltip
        />

        <Tooltip label={formatMsDuration(durationInMs)} withArrow>
          <Group gap={5}>
            <IconFireExtinguisher stroke={1.5} size={20} />
            <Text>Fixed in {humanizeDuration(durationInMs)}</Text>
          </Group>
        </Tooltip>
      </Paper>
    </Anchor>
  );
};
