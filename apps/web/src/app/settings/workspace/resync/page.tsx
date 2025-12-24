import {
  Accordion,
  ActionIcon,
  Button,
  Group,
  List,
  Modal,
  Paper,
  Progress,
  Select,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../../../../providers/workspace.provider";
import {
  useScheduleSyncBatchMutation,
  useWorkspaceLastSyncBatchQuery,
} from "../../../../api/sync-batch.api";
import { IconCheck, IconInfoCircle } from "@tabler/icons-react";
import { formatLocaleDate } from "../../../../providers/date.provider";
import { parseISO } from "date-fns";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../../../providers/notification.provider";
import { getErrorMessage } from "../../../../providers/error-message.provider";

export const WorkspaceResyncPage = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { workspace } = useWorkspace();
  const { data: lastSyncBatchData, isLoading } = useWorkspaceLastSyncBatchQuery(
    {
      workspaceId: workspace.id,
    },
    {
      refetchInterval: 3000,
    },
  );

  const { mutate: scheduleSyncBatch } = useScheduleSyncBatchMutation();
  const [sinceDaysAgo, setSinceDaysAgo] = useState<string>("365");
  const [hasResynced, setHasResynced] = useState(false);

  const lastSyncBatch = lastSyncBatchData?.workspace?.lastSyncBatch;

  const isInProgress =
    !!lastSyncBatch?.scheduledAt && !lastSyncBatch?.finishedAt;

  useEffect(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (lastSyncBatch && !lastSyncBatch.finishedAt) {
      setHasResynced(true);
    }
  }, [lastSyncBatch]);

  const handleResync = () => {
    scheduleSyncBatch(
      {
        input: {
          workspaceId: workspace.id,
          sinceDaysAgo: parseInt(sinceDaysAgo),
        },
      },
      {
        onSuccess: () => {
          showSuccessNotification({ message: "Resync operation scheduled." });
          setHasResynced(true);
        },
        onError: (error) => {
          showErrorNotification({
            message: getErrorMessage(error),
          });
        },
      },
    );
  };

  const canResync = !isInProgress && !hasResynced;

  return (
    <>
      <Modal.Root
        opened={isOpen}
        onClose={() => navigate("/settings/workspace")}
        centered
        size="md"
      >
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header
            style={{ borderBottom: "1px solid var(--mantine-color-dark-4)" }}
          >
            <Modal.Title>Resync Workspace</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          {isLoading && <Skeleton height={100} />}
          {!isLoading && (
            <Modal.Body py="lg">
              <Stack>
                <Accordion chevronPosition="right" variant="contained">
                  <Accordion.Item value="1">
                    <Accordion.Control aria-label="How it works">
                      <Group wrap="nowrap">
                        <IconInfoCircle size={16} />
                        <div>
                          <Text>How it works</Text>
                          <Text size="sm" c="dimmed" fw={400}>
                            All data from GitHub will be resynced.
                          </Text>
                        </div>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <List fz="sm">
                        <List.Item>
                          No data will be lost. This is a safe operation.
                        </List.Item>
                        <List.Item>
                          You can only resync once every 24 hours.
                        </List.Item>
                        <List.Item>
                          This can be useful when you want to recalculate the
                          Pull Request sizing, retroactively fill the deployment
                          history for applications, or fix missing data.
                        </List.Item>
                      </List>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>

                {canResync && (
                  <Select
                    value={sinceDaysAgo}
                    onChange={(value) => setSinceDaysAgo(value ?? "365")}
                    label="How far back to resync data from"
                    data={[
                      { label: "Last 365 days", value: "365" },
                      { label: "Last 90 days", value: "90" },
                      { label: "Last 30 days", value: "30" },
                      { label: "Last 7 days", value: "7" },
                      { label: "Last day", value: "1" },
                    ]}
                  />
                )}

                {isInProgress && lastSyncBatch && (
                  <Paper p="sm" withBorder>
                    <Stack gap={5}>
                      <Text fz="sm">
                        A resync is in progress since{" "}
                        {formatLocaleDate(parseISO(lastSyncBatch.scheduledAt), {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                      <Tooltip
                        label={`${lastSyncBatch.progress}%`}
                        zIndex={900}
                        position="top-end"
                      >
                        <Progress
                          value={Math.max(10, lastSyncBatch.progress)}
                          color="green.4"
                          animated
                          size="sm"
                        />
                      </Tooltip>
                    </Stack>
                  </Paper>
                )}

                {!isInProgress && hasResynced && (
                  <Paper p="sm" withBorder>
                    <Group>
                      <ActionIcon size="lg" color="green" radius="xl">
                        <IconCheck size={20} />
                      </ActionIcon>
                      <Text>Resync completed successfully.</Text>
                    </Group>
                  </Paper>
                )}
              </Stack>
            </Modal.Body>
          )}
          <Group
            justify="space-between"
            px="md"
            py="xs"
            style={{ borderTop: "1px solid var(--mantine-color-dark-4)" }}
          >
            <Button
              variant="default"
              onClick={() => navigate("/settings/workspace")}
            >
              Cancel
            </Button>
            <Button onClick={handleResync} disabled={!canResync}>
              Resync
            </Button>
          </Group>
        </Modal.Content>
      </Modal.Root>
    </>
  );
};
