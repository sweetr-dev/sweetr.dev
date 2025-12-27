import { Menu, Switch } from "@mantine/core";

export interface FilterArchivedOnlyProps {
  checked: boolean;
  onChange: (archivedOnly: boolean) => void;
}

export const FilterArchivedOnly = ({
  checked,
  onChange,
}: FilterArchivedOnlyProps) => {
  return (
    <Menu.Item
      closeMenuOnClick={false}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onChange(!checked);
      }}
      rightSection={
        <Switch
          checked={checked}
          onChange={() => {
            onChange(!checked);
          }}
        />
      }
    >
      Archived only
    </Menu.Item>
  );
};
