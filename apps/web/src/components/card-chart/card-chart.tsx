import { ReactNode } from "react";
import {
  Paper,
  Group,
  Text,
  ActionIcon,
  Menu,
  Divider,
  Popover,
  Stack,
} from "@mantine/core";
import {
  IconDotsVertical,
  IconExternalLink,
  IconInfoCircle,
  IconSpeakerphone,
} from "@tabler/icons-react";
import { Link } from "react-router";
import { useDisclosure } from "@mantine/hooks";

interface ChartCardProps {
  title: string;
  description: string;
  children: ReactNode;
  height?: number;
  style?: React.CSSProperties;
  href?: string;
}

export const CardChart = ({
  title,
  description,
  children,
  height = 340,
  style,
  href,
}: ChartCardProps) => {
  const [menuOpened, { toggle: toggleMenu, close: closeMenu }] =
    useDisclosure(false);
  const [infoOpened, { close: closeInfo, open: openInfo }] =
    useDisclosure(false);

  return (
    <Paper
      withBorder
      h={height}
      p={0}
      display="flex"
      style={{ flexDirection: "column", ...style }}
    >
      <Group p="sm" py={8} justify="space-between" wrap="nowrap">
        <Group gap={6} wrap="nowrap" justify="center">
          <Text fw={500} c="dark.0" tt="uppercase" lineClamp={1}>
            {title}
          </Text>
          <Popover
            opened={infoOpened}
            position="bottom-start"
            width={280}
            shadow="md"
            withArrow
          >
            <Popover.Target>
              <ActionIcon
                size="xs"
                variant="subtle"
                color="dimmed"
                onMouseEnter={openInfo}
                onMouseLeave={closeInfo}
              >
                <IconInfoCircle size={14} stroke={1.5} />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown
              style={{ pointerEvents: "none" }}
              onMouseEnter={openInfo}
              onMouseLeave={closeInfo}
            >
              <Text size="xs" c="dimmed">
                {description}
              </Text>
            </Popover.Dropdown>
          </Popover>
        </Group>

        <Menu
          shadow="md"
          position="bottom-end"
          opened={menuOpened}
          onChange={toggleMenu}
        >
          <Menu.Target>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="dimmed"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <IconDotsVertical size={16} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            {href && (
              <Menu.Item
                leftSection={<IconExternalLink size={14} stroke={1.5} />}
                component={Link}
                to={href}
                onClick={closeMenu}
              >
                View Pull Requests
              </Menu.Item>
            )}
            <Menu.Item
              leftSection={<IconSpeakerphone size={14} stroke={1.5} />}
              component="a"
              href="https://sweetr.featurebase.app"
              rel="nofollow"
              target="_blank"
              onClick={closeMenu}
            >
              Give feedback
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Divider />

      <Stack p="xl" flex={1}>
        {children}
      </Stack>
    </Paper>
  );
};
