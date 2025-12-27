import { ActionIcon, Menu } from "@mantine/core";
import { Application } from "@sweetr/graphql-types/frontend/graphql";
import { IconArchive, IconDotsVertical, IconEdit } from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useArchiveApplication,
  useUnarchiveApplication,
} from "../../../../../api/applications.api";
import { IconInfo } from "../../../../../components/icon-info";
import {
  IconDeployment,
  IconIncident,
} from "../../../../../providers/icon.provider";
import { showSuccessNotification } from "../../../../../providers/notification.provider";
import { useWorkspace } from "../../../../../providers/workspace.provider";

interface MenuApplicationProps {
  application: Application;
}

export const MenuApplication = ({ application }: MenuApplicationProps) => {
  const [opened, setOpened] = useState(false);
  const { mutate: archiveApplication } = useArchiveApplication();
  const { mutate: unarchiveApplication } = useUnarchiveApplication();
  const { workspace } = useWorkspace();

  const handleToggleArchive = async () => {
    if (application.archivedAt) {
      await unarchiveApplication({
        input: { workspaceId: workspace.id, applicationId: application.id },
      });
      showSuccessNotification({ message: "Application unarchived." });
      return;
    }

    await archiveApplication({
      input: { workspaceId: workspace.id, applicationId: application.id },
    });
    showSuccessNotification({ message: "Application archived." });
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <IconDotsVertical size={24} stroke={1.5} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {!application.archivedAt && (
          <>
            <Menu.Item
              leftSection={<IconEdit stroke={1.5} size={16} />}
              component={Link}
              to={`/systems/applications/edit/${application.id}`}
            >
              Edit
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              leftSection={<IconDeployment stroke={1.5} size={16} />}
              component={Link}
              to={`/systems/deployments?application=${application.id}`}
            >
              Deployments
            </Menu.Item>
            <Menu.Item
              leftSection={<IconIncident stroke={1.5} size={16} />}
              component={Link}
              to={`/systems/incidents?application=${application.id}`}
            >
              Incidents
            </Menu.Item>
            <Menu.Divider />
          </>
        )}
        <Menu.Item
          leftSection={<IconArchive size={16} />}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleToggleArchive();
          }}
          rightSection={
            !application.archivedAt && (
              <IconInfo
                position="bottom"
                tooltip="All related deployments and incidents will be hidden from the dashboard and metrics. You can unarchive an application anytime."
              />
            )
          }
        >
          {application.archivedAt ? "Unarchive" : "Archive"}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
