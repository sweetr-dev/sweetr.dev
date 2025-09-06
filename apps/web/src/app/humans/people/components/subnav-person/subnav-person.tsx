import { Divider, Title, NavLink, Group } from "@mantine/core";
import {
  IconEyeCode,
  IconGitPullRequest,
  IconNotes,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { Person } from "@sweetr/graphql-types/frontend/graphql";
import { Subnav } from "../../../../../components/subnav";

interface SubnavPersonProps {
  person: Pick<Person, "id" | "name" | "handle">;
}

export const SubnavPerson = ({ person }: SubnavPersonProps) => {
  const { pathname } = useLocation();

  const getLink = (path: string) =>
    `/humans/people/${person.handle}${path ? `/${path}` : ""}`;

  return (
    <Subnav>
      <Group>
        <Title order={3} mt={34} lineClamp={1} title={person.name}>
          @{person.handle}
        </Title>
      </Group>
      <Divider label="About" labelPosition="left" mt="sm" />
      <NavLink
        to={getLink("")}
        active={pathname === getLink("")}
        component={Link}
        label="Overview"
        leftSection={<IconNotes stroke={1.5} size={18} />}
      />

      <Divider label="Work" labelPosition="left" mt="sm" />
      <NavLink
        to={getLink("pull-requests")}
        active={pathname.startsWith(getLink("pull-requests"))}
        component={Link}
        label="Pull Requests"
        leftSection={<IconGitPullRequest stroke={1.5} size={18} />}
      />
      <NavLink
        to={getLink("code-reviews")}
        active={pathname.startsWith(getLink("code-reviews"))}
        component={Link}
        label="Code Reviews"
        leftSection={<IconEyeCode stroke={1.5} size={18} />}
      />
    </Subnav>
  );
};
