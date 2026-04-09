import { useEffect, useState } from "react";
import { useWorkspace } from "../../providers/workspace.provider";
import { useWorkspaceSyncProgressQuery } from "../../api/workspaces.api";
import { useLocalStorage } from "@mantine/hooks";

type SyncStatus = "unknown" | "in-progress" | "completed" | "acknowledged";

export const useSyncProgress = () => {
  const { workspace } = useWorkspace();
  const [syncStatus, setSyncStatus] = useLocalStorage<SyncStatus>({
    key: `workspace:${workspace.id}:syncStatus`,
    defaultValue: "unknown",
    getInitialValueInEffect: false,
  });
  const [isAutoPolling, setAutoPolling] = useState(true);

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

    if (syncStatus === "unknown" && progress >= 100) {
      setAutoPolling(false);
      setSyncStatus("acknowledged");
    } else if (syncStatus === "acknowledged") {
      setAutoPolling(false);
    } else if (progress >= 100 && syncStatus !== "completed") {
      setAutoPolling(false);
      setSyncStatus("completed");
    } else if (progress < 100 && syncStatus !== "in-progress") {
      setSyncStatus("in-progress");
    }
  }, [progress, syncStatus, setSyncStatus]);

  const acknowledge = () => {
    setSyncStatus("acknowledged");
  };

  const showOnboarding =
    syncStatus === "in-progress" || syncStatus === "completed";

  return {
    syncStatus,
    progress: progress ?? 0,
    acknowledge,
    showOnboarding,
  };
};
