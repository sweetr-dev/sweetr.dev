import { Combobox, useCombobox, ComboboxProps, Button } from "@mantine/core";
import { TeamMemberRole } from "@sweetr/graphql-types/frontend/graphql";
import {
  teamRoleColorMap,
  teamRoles,
} from "../../../../providers/team-role.provider";

interface InputSelectPersonProps extends ComboboxProps {
  onChange: (role: TeamMemberRole) => void;
  value?: TeamMemberRole;
}

export const InputSelectRole = ({
  onChange,
  value,
  ...props
}: InputSelectPersonProps) => {
  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      combobox.focusTarget();
    },
    onDropdownOpen: () => {
      combobox.focusSearchInput();
    },
  });

  const handleOptionSubmit = (role: string) => {
    combobox.closeDropdown();

    onChange(role as TeamMemberRole);
  };

  const options = teamRoles.map((role) => (
    <Combobox.Option value={role} key={role} tt="capitalize">
      {/* TO-DO: i18n */}
      {role === "QA" ? role : role.toLowerCase()}
    </Combobox.Option>
  ));

  return (
    <Combobox
      variant="filled"
      onOptionSubmit={handleOptionSubmit}
      store={combobox}
      position="bottom-end"
      withinPortal={false}
      {...props}
    >
      <Combobox.Target>
        <Button
          variant="light"
          color={value ? teamRoleColorMap[value] : "gray"}
          mah={24}
          onClick={() => combobox.toggleDropdown()}
          radius="xl"
          tt="capitalize"
        >
          {value === "QA" ? value : value?.toLowerCase()}
        </Button>
      </Combobox.Target>

      <Combobox.Dropdown miw={100}>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
