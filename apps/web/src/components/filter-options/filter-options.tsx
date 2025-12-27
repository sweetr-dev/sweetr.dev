import { ActionIcon, Menu, MenuProps } from "@mantine/core";
import { IconFilterCog } from "@tabler/icons-react";

export interface FilterOptionsProps extends MenuProps {}

export const FilterOptions = ({ children, ...props }: FilterOptionsProps) => {
  return (
    <Menu {...props} position="bottom-start" width={200}>
      <Menu.Target>
        <ActionIcon
          color="var(--mantine-color-body)"
          size={36}
          bd={
            "calc(.0625rem*var(--mantine-scale)) solid var(--mantine-color-dark-4)"
          }
        >
          <IconFilterCog size={16} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>{children}</Menu.Dropdown>
    </Menu>
  );
};
