import { ActionIcon, Code, Menu } from "@mantine/core";
import {
  IconDotsCircleHorizontal,
  IconPencil,
  IconArchive,
} from "@tabler/icons-react";
import { FC, useState } from "react";
import {
  useArchiveTeam,
  useUnarchiveTeam,
} from "../../../../../../api/teams.api";
import { showSuccessNotification } from "../../../../../../providers/notification.provider";
import { useHotkeys } from "@mantine/hooks";
import { useContextualActions } from "../../../../../../providers/contextual-actions.provider";
import { useWorkspace } from "../../../../../../providers/workspace.provider";
interface MenuTeamProps {
  teamId: string;
  isTeamArchived: boolean;
  upsertDrawerControl: {
    readonly open: () => void;
    readonly close: () => void;
    readonly toggle: () => void;
  };
}

export const MenuTeam: FC<MenuTeamProps> = ({
  upsertDrawerControl,
  isTeamArchived,
  teamId,
}) => {
  const { mutate: archiveTeam } = useArchiveTeam();
  const { mutate: unarchiveTeam } = useUnarchiveTeam();
  const [opened, setOpened] = useState(false);
  const { workspace } = useWorkspace();

  useHotkeys([
    [
      "e",
      () => {
        setOpened(false);
        upsertDrawerControl.open();
      },
    ],
  ]);

  useContextualActions(
    {
      teamArchival: {
        label: `${isTeamArchived ? "Unarchive" : "Archive"} team`,
        description: isTeamArchived
          ? "Restore the team"
          : "Hide it from the team list",
        icon: IconArchive,
        onClick: () => {
          handleToggleArchive();
        },
      },
    },
    [isTeamArchived],
    false,
  );

  const handleToggleArchive = async () => {
    if (isTeamArchived) {
      await unarchiveTeam({ input: { workspaceId: workspace.id, teamId } });
      showSuccessNotification({ message: "Team unarchived." });
      return;
    }

    await archiveTeam({ input: { workspaceId: workspace.id, teamId } });
    showSuccessNotification({ message: "Team archived." });
  };

  return (
    <Menu
      shadow="md"
      position="bottom-end"
      opened={opened}
      onChange={setOpened}
    >
      <Menu.Target>
        <ActionIcon size="lg" color="dark">
          <IconDotsCircleHorizontal size={24} stroke={1.5} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconPencil size={16} />}
          rightSection={<Code>e</Code>}
          onClick={upsertDrawerControl.open}
        >
          Edit
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<IconArchive size={16} />}
          onClick={() => handleToggleArchive()}
        >
          {isTeamArchived ? "Unarchive" : "Archive"}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
