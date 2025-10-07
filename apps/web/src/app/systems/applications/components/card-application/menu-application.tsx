import { useState } from "react";
import { Menu, ActionIcon } from "@mantine/core";
import { IconDotsVertical, IconEdit } from "@tabler/icons-react";
import { Application } from "@sweetr/graphql-types/frontend/graphql";
import {
  IconDeployment,
  IconIncident,
} from "../../../../../providers/icon.provider";
import { Link } from "react-router-dom";

interface MenuApplicationProps {
  application: Application;
}

export const MenuApplication = ({ application }: MenuApplicationProps) => {
  const [opened, setOpened] = useState(false);

  return (
    <Menu
      shadow="md"
      position="bottom-end"
      opened={opened}
      onChange={setOpened}
    >
      <Menu.Target>
        <ActionIcon
          size="sm"
          variant="transparent"
          color="var(--mantine-color-text)"
        >
          <IconDotsVertical size={24} stroke={1.5} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconEdit stroke={1.5} size={16} />}
          component={Link}
          to={`/systems/applications/edit/${application.id}`}
        >
          Edit
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<IconDeployment stroke={1.5} size={16} />}
          component={Link}
          to={`/systems/deployments?application=${application.id}`}
        >
          Deployments
        </Menu.Item>
        <Menu.Item
          leftSection={<IconIncident stroke={1.5} size={16} />}
          component={Link}
          to={`/systems/incidents?application=${application.id}`}
        >
          Incidents
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
