import { Badge, Divider, Title, NavLink } from "@mantine/core";
import {
  IconApps,
  IconBuildingCommunity,
  IconCash,
  IconUser,
  IconUserHexagon,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { Subnav } from "../../../../components/subnav";
import { IconPullRequest } from "../../../../providers/icon.provider";

export const SubnavSettings = () => {
  const { pathname } = useLocation();
  const { workspace } = useWorkspace();

  // TO-DO: Add menus to spotlight.
  return (
    <Subnav>
      <Title order={3} mt={34}>
        Settings
      </Title>
      <Divider
        label={workspace?.name || "Workspace"}
        labelPosition="left"
        mt="sm"
      />
      <NavLink
        to="/settings/workspace"
        active={pathname.startsWith("/settings/workspace")}
        component={Link}
        label="Workspace"
        leftSection={<IconBuildingCommunity stroke={1.5} size={18} />}
      />
      {workspace.billing && (
        <NavLink
          to="/settings/billing"
          active={pathname.startsWith("/settings/billing")}
          component={Link}
          style={{ borderRadius: 4 }}
          label="Billing"
          leftSection={<IconCash stroke={1.5} size={18} />}
        />
      )}
      <NavLink
        to="/settings/integrations"
        active={pathname.startsWith("/settings/integrations")}
        component={Link}
        label="Integrations"
        leftSection={<IconApps stroke={1.5} size={18} />}
      />
      <NavLink
        to="#"
        component={Link}
        label="Users"
        disabled
        rightSection={
          <Badge size="xs" variant="default">
            Soon
          </Badge>
        }
        leftSection={<IconUserHexagon stroke={1.5} size={18} />}
      />
      <Divider label="Misc" labelPosition="left" mt="md" />
      <NavLink
        to="/settings/pull-request"
        active={pathname.startsWith("/settings/pull-request")}
        component={Link}
        label="Pull Request"
        leftSection={<IconPullRequest stroke={1.5} size={18} />}
      />
      <Divider label="You" labelPosition="left" mt="md" />
      <NavLink
        to="/settings/my-account"
        active={pathname.startsWith("/settings/my-account")}
        component={Link}
        label="My account"
        leftSection={<IconUser stroke={1.5} size={18} />}
      />
    </Subnav>
  );
};
