import {
  Anchor,
  Avatar,
  Box,
  Code,
  Group,
  Paper,
  Text,
  Tooltip,
} from "@mantine/core";
import { Incident } from "@sweetr/graphql-types/frontend/graphql";
import {
  IconCalendarFilled,
  IconFireExtinguisher,
  IconFlame,
  IconQuestionMark,
} from "@tabler/icons-react";
import { differenceInMilliseconds, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { AvatarUser } from "../../../../../components/avatar-user";
import {
  formatLocaleDate,
  formatMsDuration,
  humanizeDuration,
} from "../../../../../providers/date.provider";
import { useFilterSearchParameters } from "../../../../../providers/filter.provider";
import { MenuIncident } from "./menu-incident";

export const CardIncident = ({ incident }: { incident: Incident }) => {
  const durationInMs = incident.resolvedAt
    ? differenceInMilliseconds(
        parseISO(incident.resolvedAt),
        parseISO(incident.detectedAt),
      )
    : 0;
  const searchParams = useFilterSearchParameters();

  return (
    <Anchor
      component={Link}
      to={`/systems/incidents/edit/${incident.id}?${searchParams.toString()}`}
      underline="never"
      c="dark.0"
      className="subgrid grow-on-hover"
      data-columns="7"
    >
      <Paper
        px="md"
        pl="lg"
        radius="md"
        withBorder
        className={`subgrid items-center`}
        data-columns="6"
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

        <Box>
          {incident.leader && (
            <AvatarUser
              name={incident.leader.name}
              src={incident.leader.avatar || undefined}
              size="sm"
              tooltip={`Response led by ${incident.leader.name}`}
            />
          )}
          {!incident.leader && (
            <Tooltip label="Unassigned">
              <Avatar size="sm">
                <IconQuestionMark stroke={1.5} size={16} />
              </Avatar>
            </Tooltip>
          )}
        </Box>

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
        <MenuIncident incident={incident} />
      </Paper>
    </Anchor>
  );
};
