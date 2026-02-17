import { ActionIcon, Menu, MenuProps } from "@mantine/core";
import { IconFilterCog } from "@tabler/icons-react";

export interface FilterOptionsProps extends MenuProps {
  isFiltering?: boolean;
}

export const FilterOptions = ({
  children,
  isFiltering,
  ...props
}: FilterOptionsProps) => {
  const iconColor = isFiltering ? "var(--mantine-color-green-5)" : undefined;

  return (
    <Menu {...props} position="bottom-start" width={200}>
      <Menu.Target>
        <ActionIcon
          color="var(--mantine-color-body)"
          c={iconColor}
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
