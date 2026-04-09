import {
  Stack,
  Paper,
  Title,
  Text,
  Progress,
  Button,
  Group,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCircleNumber1Filled,
  IconCircleNumber2Filled,
} from "@tabler/icons-react";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { ButtonDocs } from "../../../../components/button-docs";

interface SyncOnboardingProps {
  progress: number;
  isCompleted: boolean;
  onAcknowledge: () => void;
}

export const SyncOnboarding = ({
  progress,
  isCompleted,
  onAcknowledge,
}: SyncOnboardingProps) => {
  const { workspace } = useWorkspace();

  return (
    <>
      {!isCompleted && (
        <>
          <Stack gap="xs">
            <Title order={1} size="h3">
              Sweetr is syncing {workspace.name} GitHub data
            </Title>
            <Text c="dimmed">
              This is the initial sync — we're pulling in your repositories,
              pull requests, and code reviews. <br />
            </Text>
          </Stack>

          <Paper withBorder bg="dark.8" p="md" mt="xs">
            <Stack gap={4}>
              <Group justify="space-between">
                <Text fw={500} fz="xs" c="green.4">
                  Syncing...
                </Text>
                <Text fw={500} c="green.4">
                  {Math.round(progress)}%
                </Text>
              </Group>
              <Progress
                size="xs"
                radius="md"
                value={Math.max(2, progress)}
                color="green.6"
                animated
              />
            </Stack>
          </Paper>
          <Text c="dimmed" fz="xs" mt="xs" ta="right">
            This may take a little while depending on the size of your
            organization.
          </Text>
        </>
      )}

      {isCompleted && (
        <Paper withBorder p="lg" radius="md">
          <Stack gap="xs">
            <Group gap="sm">
              <Title order={3}>Sync complete</Title>
            </Group>
            <Text c="dimmed">
              Your GitHub data is ready. You can now explore all of your
              historic data in the dashboard.
            </Text>
          </Stack>
          <Group mt="md">
            <Button variant="filled" onClick={onAcknowledge}>
              Acknowledge
            </Button>
          </Group>
        </Paper>
      )}

      <Stack gap={5} mt="xl">
        <Title order={1} size="h3">
          Get started with Sweetr
        </Title>
        <Text c="dimmed">While you wait, here's what to do next.</Text>
      </Stack>

      <Stack gap="sm" mt="md">
        <Paper withBorder p="lg" radius="md">
          <Group justify="space-between" wrap="nowrap" gap="md">
            <Group
              gap="sm"
              align="center"
              wrap="nowrap"
              style={{ flex: 1, minWidth: 0 }}
            >
              <ThemeIcon
                variant="light"
                color="green.4"
                size="xl"
                style={{ flexShrink: 0 }}
              >
                <IconCircleNumber1Filled size={20} />
              </ThemeIcon>
              <div>
                <Title order={5}>Set up teams</Title>
                <Text fz="sm" c="dimmed">
                  We've imported your GitHub teams. Review and create more as
                  needed.
                </Text>
              </div>
            </Group>
            <ButtonDocs
              href="https://docs.sweetr.dev/get-started/onboarding#teams"
              variant="light"
            />
          </Group>
        </Paper>

        <Paper withBorder p="lg" radius="md">
          <Group justify="space-between" wrap="nowrap" gap="md">
            <Group
              gap="sm"
              align="center"
              wrap="nowrap"
              style={{ flex: 1, minWidth: 0 }}
            >
              <ThemeIcon
                variant="light"
                color="green.4"
                size="xl"
                style={{ flexShrink: 0 }}
              >
                <IconCircleNumber2Filled size={20} />
              </ThemeIcon>
              <div>
                <Title order={5}>
                  Set up applications to unlock DORA metrics
                </Title>
                <Text fz="sm" c="dimmed">
                  We created one per repository. Adjust to match your real
                  production services and monorepos.
                </Text>
              </div>
            </Group>
            <ButtonDocs
              href="https://docs.sweetr.dev/get-started/onboarding#dora-metrics"
              variant="light"
            />
          </Group>
        </Paper>
      </Stack>
    </>
  );
};
