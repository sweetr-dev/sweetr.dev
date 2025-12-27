import { ActionIcon, Menu } from "@mantine/core";
import { Environment } from "@sweetr/graphql-types/frontend/graphql";
import { IconArchive, IconDotsVertical } from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useArchiveEnvironment,
  useUnarchiveEnvironment,
} from "../../../../../api/environments.api";
import { IconInfo } from "../../../../../components/icon-info";
import { getErrorMessage } from "../../../../../providers/error-message.provider";
import {
  IconDeployment,
  IconIncident,
} from "../../../../../providers/icon.provider";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../../../../providers/notification.provider";
import { useWorkspace } from "../../../../../providers/workspace.provider";

interface MenuEnvironmentProps {
  environment: Environment;
}

export const MenuEnvironment = ({ environment }: MenuEnvironmentProps) => {
  const [opened, setOpened] = useState(false);
  const { mutate: archiveEnvironment } = useArchiveEnvironment();
  const { mutate: unarchiveEnvironment } = useUnarchiveEnvironment();
  const { workspace } = useWorkspace();

  const handleToggleArchive = async () => {
    if (environment.archivedAt) {
      await unarchiveEnvironment(
        { input: { workspaceId: workspace.id, environmentId: environment.id } },
        {
          onSuccess: () => {
            showSuccessNotification({ message: "Environment unarchived." });
          },
          onError: (error) => {
            showErrorNotification({ message: getErrorMessage(error) });
          },
        },
      );
      return;
    }

    await archiveEnvironment(
      { input: { workspaceId: workspace.id, environmentId: environment.id } },
      {
        onSuccess: () => {
          showSuccessNotification({ message: "Environment archived." });
        },
        onError: (error) => {
          showErrorNotification({ message: getErrorMessage(error) });
        },
      },
    );
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
          color="var(--mantine-color-text)"
          className="row-action-menu"
        >
          <IconDotsVertical size={24} stroke={1.5} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {!environment.archivedAt && (
          <>
            <Menu.Item
              leftSection={<IconDeployment stroke={1.5} size={16} />}
              component={Link}
              to={`/systems/deployments?environment=${environment.id}`}
            >
              Deployments
            </Menu.Item>
            <Menu.Item
              leftSection={<IconIncident stroke={1.5} size={16} />}
              component={Link}
              to={`/systems/incidents?environment=${environment.id}`}
            >
              Incidents
            </Menu.Item>
            <Menu.Divider />
          </>
        )}
        <Menu.Item
          leftSection={<IconArchive size={16} stroke={1.5} />}
          onClick={handleToggleArchive}
          rightSection={
            !environment.archivedAt && (
              <IconInfo
                position="bottom"
                tooltip="All related deployments and incidents will be hidden from the dashboard and metrics. You can unarchive an environment anytime."
              />
            )
          }
        >
          {environment.archivedAt ? "Unarchive" : "Archive"}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
