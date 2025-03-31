import {
  Box,
  Button,
  Group,
  Paper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconExternalLink, IconUser } from "@tabler/icons-react";
import { AvatarUser } from "../../../components/avatar-user";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { useWorkspace } from "../../../providers/workspace.provider";
import { PageContainer } from "../../../components/page-container";
import { SettingsApiKey } from "./components/settings-api-key";

export const WorkspaceSettingsPage = () => {
  const { workspace } = useWorkspace();

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Settings" }, { label: "Workspace" }]} />

      <Box maw={600}>
        <Title order={3}>Workspace</Title>
        <Paper mt="xs" p="lg" withBorder>
          <AvatarUser
            src={workspace.avatar}
            name={workspace.name}
            size={128}
            radius="50%"
            mx="auto"
          />

          <TextInput
            mt="xs"
            label="Name"
            value={workspace.name}
            leftSection={<IconUser size={16} stroke={1.5} />}
            disabled
          />
          <Text color="dimmed" size="sm" mt="md">
            Your workspace data is automatically synced with GitHub.
          </Text>
        </Paper>

        <Title order={3} mt={40}>
          API
        </Title>

        <SettingsApiKey />

        <Title order={3} c="red" mt={40}>
          Danger Zone
        </Title>

        <Paper mt="xs" p="md" withBorder>
          <Group justify="space-between" wrap="nowrap">
            <Box flex="1 1">
              <Title order={5}>Delete workspace</Title>
              <Text c="dimmed" size="sm">
                Uninstall the app from your GitHub organization to remove all
                organization data stored in our servers.
              </Text>
            </Box>
            <Button
              color="red"
              variant="outline"
              ml="xl"
              component="a"
              href={workspace.gitUninstallUrl}
              target="_blank"
              rightSection={<IconExternalLink stroke={1.5} size={16} />}
            >
              Uninstall App
            </Button>
          </Group>
        </Paper>
      </Box>
    </PageContainer>
  );
};
