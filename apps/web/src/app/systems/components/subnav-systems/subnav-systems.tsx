import { Divider, Title, NavLink, Badge } from "@mantine/core";
import { IconForms, IconServer } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { Subnav } from "../../../../components/subnav";
import {
  IconApplication,
  IconDeployment,
  IconIncident,
  IconRepository,
} from "../../../../providers/icon.provider";

export const SubnavSystems = () => {
  const { pathname } = useLocation();

  // TO-DO: Add menus to spotlight.
  return (
    <Subnav>
      <Title order={3} mt={34}>
        Systems
      </Title>
      <Divider label="Activity" labelPosition="left" mt="sm" />
      <NavLink
        to="/systems/deployments"
        active={pathname.startsWith("/systems/deployments")}
        component={Link}
        label="Deployments"
        leftSection={<IconDeployment stroke={1.5} size={18} />}
      />
      <NavLink
        to="/systems/incidents"
        active={pathname.startsWith("/systems/incidents")}
        component={Link}
        label="Incidents"
        leftSection={<IconIncident stroke={1.5} size={18} />}
      />
      <Divider label="Catalog" labelPosition="left" mt="sm" />
      <NavLink
        to="/systems/applications"
        active={pathname.startsWith("/systems/applications")}
        component={Link}
        label="Applications"
        leftSection={<IconApplication stroke={1.5} size={18} />}
      />
      <NavLink
        to="/systems/environments"
        active={pathname.startsWith("/systems/environments")}
        component={Link}
        label="Environments"
        leftSection={<IconServer stroke={1.5} size={18} />}
      />
      <NavLink
        to="/systems/repositories"
        active={pathname.startsWith("/systems/repositories")}
        component={Link}
        label="Repositories"
        leftSection={<IconRepository stroke={1.5} size={18} />}
      />
      <Divider label="Improve" labelPosition="left" mt="sm" />

      <NavLink
        to="#"
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
    </Subnav>
  );
};
