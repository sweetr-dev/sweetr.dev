import { Divider, Title, NavLink, Badge } from "@mantine/core";
import {
  IconBell,
  IconChartArcs,
  IconForms,
  IconGitPullRequest,
  IconMessage,
  IconTarget,
  IconUsers,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { Team } from "@sweetr/graphql-types/frontend/graphql";
import { Subnav } from "../../../../../components/subnav";

interface SubnavTeamProps {
  team: Omit<Team, "members">;
}

export const SubnavTeam = ({ team }: SubnavTeamProps) => {
  const { pathname } = useLocation();

  const getLink = (path: string) =>
    `/teams/${team.id}${path ? `/${path}` : ""}`;

  return (
    <Subnav>
      <Title order={3} mt={34} lineClamp={1} title={team.name}>
        {team.name} {team.icon}
      </Title>

      <Divider label="Team" labelPosition="left" mt="sm" />
      <NavLink
        to={getLink("")}
        active={pathname === getLink("")}
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
        leftSection={<IconGitPullRequest stroke={1.5} size={18} />}
      />
      <NavLink
        to={getLink("health-and-performance")}
        active={pathname.startsWith(getLink("health-and-performance"))}
        component={Link}
        label="Health & Performance"
        leftSection={<IconChartArcs stroke={1.5} size={18} />}
      />
      <NavLink
        to={getLink("dx-surveys")}
        active={pathname.startsWith(getLink("dx-surveys"))}
        component={Link}
        label="DX Surveys"
        leftSection={<IconForms stroke={1.5} size={18} />}
        disabled
        rightSection={
          <Badge size="xs" variant="default">
            Soon
          </Badge>
        }
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
        disabled
        rightSection={
          <Badge size="xs" variant="default">
            Soon
          </Badge>
        }
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
