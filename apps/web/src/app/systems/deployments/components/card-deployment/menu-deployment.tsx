import { ActionIcon, Menu } from "@mantine/core";
import { Deployment } from "@sweetr/graphql-types/frontend/graphql";
import { IconArchive, IconDotsVertical } from "@tabler/icons-react";
import { useState } from "react";
import {
  useArchiveDeployment,
  useUnarchiveDeployment,
} from "../../../../../api/deployments.api";
import { IconInfo } from "../../../../../components/icon-info";
import { showSuccessNotification } from "../../../../../providers/notification.provider";
import { useWorkspace } from "../../../../../providers/workspace.provider";

interface MenuDeploymentProps {
  deployment: Deployment;
}

export const MenuDeployment = ({ deployment }: MenuDeploymentProps) => {
  const [opened, setOpened] = useState(false);
  const { mutate: archiveDeployment } = useArchiveDeployment();
  const { mutate: unarchiveDeployment } = useUnarchiveDeployment();
  const { workspace } = useWorkspace();

  const handleToggleArchive = async () => {
    if (deployment.archivedAt) {
      await unarchiveDeployment({
        input: { workspaceId: workspace.id, deploymentId: deployment.id },
      });
      showSuccessNotification({ message: "Deployment unarchived." });
      return;
    }

    await archiveDeployment({
      input: { workspaceId: workspace.id, deploymentId: deployment.id },
    });
    showSuccessNotification({ message: "Deployment archived." });
  };

  return (
    <Menu
      shadow="md"
      position="bottom-end"
      opened={opened}
      onChange={setOpened}
    >
      <Menu.Target>
        <ActionIcon
          size="sm"
          variant="transparent"
          className="row-action-menu"
          color="var(--mantine-color-text)"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <IconDotsVertical size={24} stroke={1.5} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconArchive size={16} />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleToggleArchive();
          }}
          rightSection={
            !deployment.archivedAt && (
              <IconInfo
                position="bottom"
                tooltip="The deployment will be hidden from the dashboard and metrics. You can unarchive a deployment anytime."
              />
            )
          }
        >
          {deployment.archivedAt ? "Unarchive" : "Archive"}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
