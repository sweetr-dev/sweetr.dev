import { Badge, Divider, Title, NavLink } from "@mantine/core";
import {
  IconApps,
  IconBox,
  IconBrandGithub,
  IconBuildingCommunity,
  IconCash,
  IconGitPullRequest,
  IconRocket,
  IconServerBolt,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { Subnav } from "../../../../components/subnav";

export const SubnavSystems = () => {
  const { pathname } = useLocation();
  const { workspace } = useWorkspace();

  // TO-DO: Add menus to spotlight.
  return (
    <Subnav>
      <Title order={3} mt={34}>
        Systems
      </Title>
      <Divider label="Services" labelPosition="left" mt="sm" />
      <NavLink
        to="/systems/apps"
        active={pathname === "/systems/apps"}
        component={Link}
        label="Applications"
        leftSection={<IconBox stroke={1.5} size={18} />}
      />
      <NavLink
        to="/systems/deployments"
        active={pathname === "/systems/deployments"}
        component={Link}
        label="Deployments"
        leftSection={<IconRocket stroke={1.5} size={18} />}
      />
      <Divider label="Source Code" labelPosition="left" mt="sm" />
      <NavLink
        to="/systems/repositories"
        active={pathname === "/systems/repositories"}
        component={Link}
        label="Repositories"
        leftSection={<IconBrandGithub stroke={1.5} size={18} />}
      />
    </Subnav>
  );
};
