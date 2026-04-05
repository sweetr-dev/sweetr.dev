import { Box, Text, Group, Tooltip, Button } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { clearSandboxMode } from "./sandbox-context";
import { logout } from "../providers/auth.provider";

const BANNER_HEIGHT = 32;

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
      bg="violet.9"
      py={4}
      px="md"
      h={BANNER_HEIGHT}
      style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }}
    >
      <Group justify="center" gap="sm" h="100%">
        <Tooltip
          label="All data is mocked on the frontend for demonstration purposes. Charts and metrics are illustrative and not processed by the backend."
          multiline
          w={280}
          withArrow
          position="bottom"
        >
          <Group gap={6} style={{ cursor: "help" }}>
            <IconInfoCircle size={16} color="white" stroke={1.5} />
            <Text size="sm" c="white" fw={500}>
              You're viewing sandbox data.
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
            size="compact-xs"
            variant="white"
            color="violet.9"
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
