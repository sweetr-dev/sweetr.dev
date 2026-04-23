import { Box, Text, Group, Tooltip, Button } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { clearSandboxMode } from "./sandbox-context";
import { logout } from "../providers/auth.provider";

const BANNER_HEIGHT = 45;

export const SANDBOX_BANNER_HEIGHT = BANNER_HEIGHT;

const handleExitSandbox = async () => {
  const { stopSandboxWorker } = await import("./sandbox-provider");
  await stopSandboxWorker();
  clearSandboxMode();
  logout();
  window.location.href = "/login";
};

export const SandboxBanner = () => {
  return (
    <Box
      bg="violet"
      px="md"
      h={BANNER_HEIGHT}
      style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }}
    >
      <Group justify="center" h="100%" gap="xl">
        <Tooltip
          label="All data is mocked on the frontend for demonstration purposes. Charts and metrics are illustrative and not processed by the backend."
          multiline
          w={280}
          withArrow
          position="bottom"
        >
          <Group gap={6} style={{ cursor: "help" }}>
            <IconInfoCircle size={16} color="white" stroke={2} />
            <Text size="sm" c="bright" fw={500}>
              You're viewing mocked sandbox data
            </Text>
          </Group>
        </Tooltip>
        <Tooltip
          label="This will exit sandbox. Log in with your GitHub account to see accurate metrics from your real data."
          withArrow
          position="bottom"
        >
          <Button
            onClick={handleExitSandbox}
            size="compact-sm"
            variant="white"
            c="violet.9"
            fw={700}
            radius="sm"
          >
            Try with your own data
          </Button>
        </Tooltip>
      </Group>
    </Box>
  );
};
