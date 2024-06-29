import {
  Menu,
  UnstyledButton,
  Text,
  Group,
  Stack,
  Skeleton,
  Box,
} from "@mantine/core";
import {
  IconLogout,
  IconSpeakerphone,
  IconBuilding,
  IconBook2,
} from "@tabler/icons-react";
import { FC } from "react";
import { logout } from "../../providers/auth.provider";
import { installGithubAppUrl } from "../../providers/github.provider";
import { WorkspaceSwitcher } from "../workspace-switcher";
import { AvatarUser } from "../avatar-user";
import classes from "./navbar-user.module.css";
import { useAppStore } from "../../providers/app.provider";

interface NavbarUserProps {
  onNavigate: () => void;
}

export const NavbarUser: FC<NavbarUserProps> = () => {
  const { authenticatedUser: user, availableWorkspaces } = useAppStore();

  const handleLogout = () => {
    logout();
  };

  if (!user) return <Skeleton height={50} circle />;

  return (
    <Box>
      <Menu withArrow position="right-end" offset={9}>
        <Menu.Target>
          <UnstyledButton className={classes.link}>
            <AvatarUser name={user.name} src={user.avatar} />
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Group p="sm">
            <AvatarUser src={user.avatar} size={64} name={user.name} />
            <Stack gap={0}>
              <Text fw={500}>{user.name}</Text>
              <Text
                fz="xs"
                style={{
                  maxWidth: 200,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {user.email}
              </Text>
            </Stack>
          </Group>

          <Menu.Divider />

          <Menu.Label>Switch workspace</Menu.Label>
          <Box m="sm" mt={0}>
            <WorkspaceSwitcher workspaces={availableWorkspaces} />
          </Box>

          <Menu.Divider />

          <Menu.Label>Options</Menu.Label>
          <Menu.Item
            leftSection={<IconBuilding size={14} stroke={1.5} />}
            component="a"
            href={installGithubAppUrl}
            target="_blank"
          >
            Connect new organization
          </Menu.Item>
          <Menu.Item
            leftSection={<IconBook2 size={14} stroke={1.5} />}
            component="a"
            href="https://docs.sweetr.dev"
            target="_blank"
          >
            Documentation
          </Menu.Item>

          <Menu.Item
            leftSection={<IconSpeakerphone size={14} stroke={1.5} />}
            component="a"
            href="https://github.com/orgs/sweetr-dev/discussions"
            rel="nofollow"
            target="_blank"
          >
            Give feedback
          </Menu.Item>

          <Menu.Divider />

          <Menu.Item
            component="a"
            href="/login"
            leftSection={<IconLogout size={14} stroke={1.5} />}
            onClick={handleLogout}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
};
