import { ActionIcon, Menu } from "@mantine/core";
import { Incident } from "@sweetr/graphql-types/frontend/graphql";
import { IconArchive, IconDotsVertical, IconEdit } from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useArchiveIncident,
  useUnarchiveIncident,
} from "../../../../../api/incidents.api";
import { IconInfo } from "../../../../../components/icon-info";
import { getErrorMessage } from "../../../../../providers/error-message.provider";
import { useFilterSearchParameters } from "../../../../../providers/filter.provider";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../../../../providers/notification.provider";
import { useWorkspace } from "../../../../../providers/workspace.provider";

interface MenuIncidentProps {
  incident: Incident;
}

export const MenuIncident = ({ incident }: MenuIncidentProps) => {
  const [opened, setOpened] = useState(false);
  const { mutate: archiveIncident } = useArchiveIncident();
  const { mutate: unarchiveIncident } = useUnarchiveIncident();
  const { workspace } = useWorkspace();
  const searchParams = useFilterSearchParameters();

  const handleToggleArchive = async () => {
    if (incident.archivedAt) {
      await unarchiveIncident(
        { input: { workspaceId: workspace.id, incidentId: incident.id } },
        {
          onSuccess: () => {
            showSuccessNotification({ message: "Incident unarchived." });
          },
          onError: (error) => {
            showErrorNotification({ message: getErrorMessage(error) });
          },
        },
      );
      return;
    }

    await archiveIncident(
      { input: { workspaceId: workspace.id, incidentId: incident.id } },
      {
        onSuccess: () => {
          showSuccessNotification({ message: "Incident archived." });
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <IconDotsVertical size={24} stroke={1.5} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {!incident.archivedAt && (
          <>
            <Menu.Item
              leftSection={<IconEdit stroke={1.5} size={16} />}
              component={Link}
              to={`/systems/incidents/edit/${incident.id}?${searchParams.toString()}`}
            >
              Edit
            </Menu.Item>
            <Menu.Divider />
          </>
        )}
        <Menu.Item
          leftSection={<IconArchive size={16} stroke={1.5} />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleToggleArchive();
          }}
          rightSection={
            !incident.archivedAt && (
              <IconInfo
                position="bottom"
                tooltip="The incident will be hidden from the dashboard and metrics. You can unarchive an incident anytime."
              />
            )
          }
        >
          {incident.archivedAt ? "Unarchive" : "Archive"}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
