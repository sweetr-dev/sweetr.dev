import { Divider, Title, NavLink, Badge } from "@mantine/core";
import {
  IconCircles,
  IconHeartHandshake,
  IconUsers,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { Subnav } from "../../../../components/subnav";

export const SubnavHumans = () => {
  const { pathname } = useLocation();

  return (
    <Subnav>
      <Title order={3} mt={34}>
        Humans
      </Title>
      <Divider label="Who" labelPosition="left" mt="sm" />
      <NavLink
        to="/humans/teams"
        active={pathname === "/humans/teams"}
        component={Link}
        label="Teams"
        leftSection={<IconCircles stroke={1.5} size={18} />}
      />
      <NavLink
        to="/humans/people"
        active={pathname === "/humans/people"}
        component={Link}
        label="People"
        leftSection={<IconUsers stroke={1.5} size={18} />}
      />

      <Divider label="Improve" labelPosition="left" mt="sm" />
      <NavLink
        to="#"
        component={Link}
        label="1:1s"
        disabled
        rightSection={
          <Badge size="xs" variant="default">
            Soon
          </Badge>
        }
        leftSection={<IconHeartHandshake stroke={1.5} size={18} />}
      />
    </Subnav>
  );
};
