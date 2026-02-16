import { Divider, Title, NavLink, Badge, Group } from "@mantine/core";
import {
  IconActivity,
  IconArrowLeft,
  IconBell,
  IconChartArcs,
  IconMessage,
  IconProgress,
  IconTarget,
  IconUsers,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { Team } from "@sweetr/graphql-types/frontend/graphql";
import { Subnav } from "../../../../../../components/subnav";
import { IconPullRequest } from "../../../../../../providers/icon.provider";
import { ActionIcon } from "@mantine/core";

interface SubnavTeamProps {
  team: Pick<Team, "id" | "name" | "icon">;
}

export const SubnavTeam = ({ team }: SubnavTeamProps) => {
  const { pathname } = useLocation();

  const getLink = (path: string) =>
    `/humans/teams/${team.id}${path ? `/${path}` : ""}`;

  return (
    <Subnav>
      <Group mt={34} align="center" gap={5}>
        <ActionIcon
          variant="transparent"
          aria-label="Settings"
          component={Link}
          to="/humans/teams"
          c="var(--mantine-color-text)"
        >
          <IconArrowLeft stroke={1.5} size={20} />
        </ActionIcon>
        <Title order={3} lineClamp={1} title={team.name}>
          {team.name} {team.icon}
        </Title>
      </Group>

      <Divider label="Team" labelPosition="left" mt="sm" />
      <NavLink
        to={getLink("")}
        active={pathname === getLink("")}
        component={Link}
        label="Work In Progress"
        leftSection={<IconProgress stroke={1.5} size={18} />}
      />

      <NavLink
        to={getLink("work-log")}
        active={pathname === getLink("work-log")}
        component={Link}
        label="Work Log"
        leftSection={<IconActivity stroke={1.5} size={18} />}
      />

      <NavLink
        to={getLink("members")}
        active={pathname === getLink("members")}
        component={Link}
        label="Members"
        leftSection={<IconUsers stroke={1.5} size={18} />}
      />

      <Divider label="Insights" labelPosition="left" mt="sm" />
      <NavLink
        to={getLink("pull-requests")}
        active={pathname.startsWith(getLink("pull-requests"))}
        component={Link}
        label="Pull Requests"
        leftSection={<IconPullRequest stroke={1.5} size={18} />}
      />
      <NavLink
        to={getLink("health-and-performance")}
        active={pathname.startsWith(getLink("health-and-performance"))}
        component={Link}
        label="Health & Performance"
        leftSection={<IconChartArcs stroke={1.5} size={18} />}
      />

      <Divider label="Improve" labelPosition="left" mt="sm" />
      <NavLink
        to={getLink("digests")}
        active={pathname.startsWith(getLink("digests"))}
        component={Link}
        label="Digests"
        leftSection={<IconMessage stroke={1.5} size={18} />}
      />
      <NavLink
        to={getLink("alerts")}
        active={pathname.startsWith(getLink("alerts"))}
        component={Link}
        label="Alerts"
        leftSection={<IconBell stroke={1.5} size={18} />}
      />
      <NavLink
        to={getLink("targets")}
        active={pathname.startsWith(getLink("targets"))}
        component={Link}
        label="Goals"
        disabled
        rightSection={
          <Badge size="xs" variant="default">
            Soon
          </Badge>
        }
        leftSection={<IconTarget stroke={1.5} size={18} />}
      />
    </Subnav>
  );
};
