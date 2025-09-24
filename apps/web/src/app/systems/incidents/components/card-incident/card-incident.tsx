import { Anchor, Box, Code, Group, Paper, Text, Tooltip } from "@mantine/core";
import {
  IconCalendarFilled,
  IconFireExtinguisher,
  IconFlame,
} from "@tabler/icons-react";
import { AvatarUser } from "../../../../../components/avatar-user";
import {
  formatLocaleDate,
  formatMsDuration,
  humanizeDuration,
} from "../../../../../providers/date.provider";
import { differenceInMilliseconds, parseISO } from "date-fns";
import { Incident } from "@sweetr/graphql-types/frontend/graphql";

export const CardIncident = ({ incident }: { incident: Incident }) => {
  const durationInMs = incident.resolvedAt
    ? differenceInMilliseconds(
        parseISO(incident.resolvedAt),
        parseISO(incident.detectedAt),
      )
    : 0;

  return (
    <Anchor
      href={`/systems/incidents/1`}
      underline="never"
      c="dark.0"
      target="_blank"
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
          {incident.team && (
            <>
              {incident.team?.icon} {incident.team?.name}
            </>
          )}
          {!incident.team && <Text>Unassigned</Text>}
        </Text>
        {incident.leader && (
          <AvatarUser
            name={incident.leader.name}
            src={incident.leader.avatar || undefined}
            size="sm"
            tooltip
          />
        )}

        <Box ta="right">
          {incident.resolvedAt ? (
            <Tooltip label={formatMsDuration(durationInMs)} withArrow>
              <Group gap={5}>
                <IconFireExtinguisher stroke={1.5} size={20} />
                <Text>Fixed in {humanizeDuration(durationInMs)}</Text>
              </Group>
            </Tooltip>
          ) : (
            <Group gap={5} c="red">
              <IconFlame stroke={1.5} size={20} />
              <Text>Ongoing</Text>
            </Group>
          )}
        </Box>
      </Paper>
    </Anchor>
  );
};
