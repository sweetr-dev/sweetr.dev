import { useEffect, useState } from "react";
import {
  hideNotification,
  showNotification,
  updateNotification,
} from "@mantine/notifications";
import { Anchor, Button, Group, Progress, Tooltip } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconCheck } from "@tabler/icons-react";
import { useWorkspace } from "../../providers/workspace.provider";
import { useWorkspaceSyncProgressQuery } from "../../api/workspaces.api";
import { useLocalStorage } from "@mantine/hooks";

export const useSyncProgressNotification = () => {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const [syncStatus, setSyncStatus] = useLocalStorage<
    "unknown" | "in-progress" | "acknowledged"
  >({
    key: `workspace:${workspace.id}:syncStatus`,
    defaultValue: "unknown",
  });
  const [isAutoPolling, setAutoPolling] = useState(true);
  const [notification, setNotification] = useState("");

  const { data } = useWorkspaceSyncProgressQuery(
    {
      workspaceId: workspace.id,
    },
    {
      refetchInterval: () => (isAutoPolling ? 1000 : false),
    },
  );

  const progress = data?.workspace.initialSyncProgress;

  useEffect(() => {
    if (progress === undefined) return;

    // A user who never saw the "in-progress" notification should never see any notification.
    if (syncStatus === "unknown" && progress >= 100) {
      setAutoPolling(false);
      setSyncStatus("acknowledged");
      return;
    }

    if (syncStatus === "acknowledged") {
      setAutoPolling(false);
      return;
    }

    if (progress !== 100) {
      setSyncStatus("in-progress");
    }

    const progressMessage = (
      <>
        Meanwhile,{" "}
        <Anchor
          fz="sm"
          onClick={() => {
            navigate("/humans/teams");
          }}
        >
          create a team
        </Anchor>{" "}
        and explore the dashboard.
        <Tooltip label={`${progress}%`} zIndex={900} position="top-end">
          <Progress
            size="sm"
            mt="xs"
            value={Math.max(10, progress || 0)}
            color="green.4"
            animated
          />
        </Tooltip>
      </>
    );

    if (!notification) {
      setNotification(
        showNotification({
          id: "sync-status",
          withCloseButton: true,
          autoClose: false,
          withBorder: true,
          color: "none",
          loading: false,
          title: "Sweetr is syncing your GitHub data.",
          message: progressMessage,
        }),
      );
    }

    if (progress === 100) {
      setAutoPolling(false);

      updateNotification({
        id: notification,
        color: "green.5",
        title: "Sync complete",
        withCloseButton: false,
        message: (
          <>
            You can now see all of your historic data in our dashboard.
            <Group mt="xs" gap={5} mb={1}>
              <Button
                variant="default"
                size="xs"
                onClick={() => {
                  setSyncStatus("acknowledged");
                  hideNotification(notification);
                }}
              >
                Acknowledge
              </Button>
            </Group>
          </>
        ),
        icon: <IconCheck size={20} stroke={3} />,
        loading: false,
      });
    } else {
      updateNotification({
        id: notification,
        message: progressMessage,
      });
    }
  }, [syncStatus, navigate, progress, setSyncStatus, notification]);
  return;
};
