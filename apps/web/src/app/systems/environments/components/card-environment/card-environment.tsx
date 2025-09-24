import { ActionIcon, Code, Group, Menu, Paper } from "@mantine/core";
import { Environment } from "@sweetr/graphql-types/frontend/graphql";
import { IconEnvironment } from "../../../../../providers/icon.provider";
import { IconArchive, IconDotsVertical } from "@tabler/icons-react";
import { useState } from "react";

interface CardEnvironmentProps {
  environment: Environment;
}

export const CardEnvironment = ({ environment }: CardEnvironmentProps) => {
  const [opened, setOpened] = useState(false);

  return (
    <Paper p="md" radius="md" withBorder>
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <IconEnvironment stroke={1.5} size={20} />

          <Code variant="default" c="white" fz="sm">
            {environment.name}
          </Code>
        </Group>
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
              leftSection={<IconArchive size={16} />}
              onClick={() => {}}
            >
              {environment.archivedAt ? "Unarchive" : "Archive"}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Paper>
  );
};
