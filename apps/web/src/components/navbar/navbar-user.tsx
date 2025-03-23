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
  IconLifebuoy,
  IconExchange,
} from "@tabler/icons-react";
import { FC } from "react";
import { logout } from "../../providers/auth.provider";
import { installGithubAppUrl } from "../../providers/github.provider";
import { WorkspaceSwitcher } from "../workspace-switcher";
import { AvatarUser } from "../avatar-user";
import classes from "./navbar-user.module.css";
import { useAppStore } from "../../providers/app.provider";
import { useSupportChat } from "./use-support-chat";

interface NavbarUserProps {
  onNavigate: () => void;
}

export const NavbarUser: FC<NavbarUserProps> = () => {
  const { authenticatedUser: user, availableWorkspaces } = useAppStore();
  const { openChat } = useSupportChat();

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

          <Menu.Divider mx={-4} />

          <Menu.Label>Switch workspace</Menu.Label>
          <Box m="sm" mt={0}>
            <WorkspaceSwitcher workspaces={availableWorkspaces} />
          </Box>
          <Menu.Divider mx={-4} />

          <Menu.Item
            leftSection={<IconBuilding size={14} stroke={1.5} />}
            component="a"
            href={installGithubAppUrl}
            target="_blank"
          >
            Connect new organization
          </Menu.Item>
          <Menu.Divider mx={-4} />

          <Menu.Label>Options</Menu.Label>
          <Menu.Item
            leftSection={<IconBook2 size={14} stroke={1.5} />}
            component="a"
            href="https://docs.sweetr.dev"
            target="_blank"
          >
            Documentation
          </Menu.Item>

          <Menu.Item
            leftSection={<IconLifebuoy size={14} stroke={1.5} />}
            onClick={() => {
              openChat();
            }}
          >
            Chat with support
          </Menu.Item>

          <Menu.Item
            leftSection={<IconSpeakerphone size={14} stroke={1.5} />}
            component="a"
            href="https://sweetr.featurebase.app"
            rel="nofollow"
            target="_blank"
          >
            Give feedback
          </Menu.Item>

          <Menu.Item
            leftSection={<IconExchange size={14} stroke={1.5} />}
            component="a"
            href="https://sweetr.featurebase.app/changelog"
            rel="nofollow"
            target="_blank"
          >
            Changelog
          </Menu.Item>

          <Menu.Divider mx={-4} />

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
