import { Badge, Divider, Stack, Title, NavLink } from "@mantine/core";
import {
  IconAspectRatio,
  IconBuildingCommunity,
  IconCash,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import { useSubnav } from "../../providers/nav.provider";
import { useWorkspace } from "../../providers/workspace.provider";

export const SubnavSettings = () => {
  const { pathname } = useLocation();
  const { workspace } = useWorkspace();
  useSubnav();

  // TO-DO: Create subnav-item component, abstract styles and add menus to spotlight.
  return (
    <Stack
      h="100%"
      pt={10}
      style={{ flexGrow: 1, flexWrap: "nowrap" }}
      gap={4}
      p="md"
    >
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
        active={pathname === "/settings/workspace"}
        component={Link}
        style={{ borderRadius: 4 }}
        label="Workspace"
        leftSection={<IconBuildingCommunity stroke={1.5} size={18} />}
      />
      {workspace.billing && (
        <NavLink
          to="/settings/billing"
          active={pathname === "/settings/billing"}
          component={Link}
          style={{ borderRadius: 4 }}
          label="Billing"
          leftSection={<IconCash stroke={1.5} size={18} />}
        />
      )}
      <NavLink
        to="#"
        component={Link}
        style={{ borderRadius: 4 }}
        label="Members"
        disabled
        rightSection={
          <Badge size="xs" variant="default">
            Soon
          </Badge>
        }
        leftSection={<IconUsers stroke={1.5} size={18} />}
      />
      <Divider label="Misc" labelPosition="left" mt="md" />
      <NavLink
        to="#"
        component={Link}
        style={{ borderRadius: 4 }}
        label="Pull Request Size"
        leftSection={<IconAspectRatio stroke={1.5} size={18} />}
        disabled
        rightSection={
          <Badge size="xs" variant="default">
            Soon
          </Badge>
        }
      />
      <Divider label="You" labelPosition="left" mt="md" />
      <NavLink
        to="/settings/my-account"
        active={pathname === "/settings/my-account"}
        component={Link}
        style={{ borderRadius: 4 }}
        label="My account"
        leftSection={<IconUser stroke={1.5} size={18} />}
      />
    </Stack>
  );
};
