import {
  Avatar,
  Combobox,
  ComboboxProps,
  InputBase,
  useCombobox,
} from "@mantine/core";
import { FC } from "react";
import { WorkspaceData, useAppStore } from "../../providers/app.provider";
import { AccountSwitcherItem } from "./workspace-switcher-item";
import { showInfoNotification } from "../../providers/notification.provider";

interface WorkspaceSwitcherProps extends ComboboxProps {
  workspaces: WorkspaceData[];
}

export const WorkspaceSwitcher: FC<WorkspaceSwitcherProps> = ({
  workspaces,
  ...props
}) => {
  const combobox = useCombobox();
  const { workspace: activeWorkspace, setWorkspace } = useAppStore();

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(value) => {
        combobox.updateSelectedOptionIndex();

        const workspace = workspaces.find(
          (workspace) => workspace.id === value,
        );

        if (!workspace) {
          console.error("Workspace not found", workspace, value);
          return;
        }

        setWorkspace(workspace);

        showInfoNotification({
          title: "Switched workspace",
        });
      }}
      {...props}
    >
      <Combobox.Target>
        <InputBase
          readOnly
          rightSection={
            <Combobox.Chevron onClick={() => combobox.openDropdown()} />
          }
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          leftSection={
            <Avatar
              onClick={() => combobox.openDropdown()}
              src={activeWorkspace?.avatar}
              size={20}
            />
          }
          value={activeWorkspace ? activeWorkspace.name : workspaces[0]?.name}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {workspaces.map((workspace) => (
            <Combobox.Option
              key={workspace.id}
              value={workspace.id.toString()}
              bg={workspace.id === activeWorkspace?.id ? "green" : undefined}
              c={workspace.id === activeWorkspace?.id ? "white" : undefined}
            >
              <AccountSwitcherItem
                label={workspace.name}
                avatar={workspace.avatar || undefined}
              />
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
