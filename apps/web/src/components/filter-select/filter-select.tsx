import {
  Button,
  Combobox,
  useCombobox,
  Group,
  CloseButton,
  Text,
} from "@mantine/core";
import { IconProps } from "@tabler/icons-react";

interface FilterSelectProps {
  label: string;
  icon: React.ComponentType<IconProps>;
  items: string[];
  initialValue?: string;
  onChange?: (value: string | null) => void;
  value: string | null;
  clearable?: boolean;
}

export const FilterSelect = ({
  label,
  icon: Icon,
  items,
  onChange,
  value,
  clearable,
}: FilterSelectProps) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const handleValueSelect = (value: string) => {
    onChange?.(value);
  };

  combobox.selectActiveOption();

  const options = items.map((item) => {
    const isActive = value === item;

    return (
      <Combobox.Option
        value={item}
        key={item}
        active={isActive}
        bg={isActive ? "var(--mantine-primary-color-light-hover)" : undefined}
      >
        <Group gap="sm">
          <Text
            fz="sm"
            style={{ textTransform: "capitalize" }}
            c={
              isActive ? "var(--mantine-primary-color-light-color)" : undefined
            }
          >
            {item.toLowerCase()}
          </Text>
        </Group>
      </Combobox.Option>
    );
  });

  const selectedLabel = value ? value.toLowerCase() : "any";

  return (
    <>
      <Combobox
        store={combobox}
        withinPortal={false}
        onOptionSubmit={handleValueSelect}
      >
        <Combobox.Target>
          <Button
            color="var(--mantine-color-body)"
            leftSection={<Icon size={16} />}
            style={{
              fontWeight: 400,
              border:
                "calc(.0625rem*var(--mantine-scale)) solid var(--mantine-color-dark-4)",
            }}
            onClick={() => combobox.toggleDropdown()}
            rightSection={
              value &&
              clearable && (
                <CloseButton
                  size="xs"
                  aria-label="Clear filter"
                  onClick={(event) => {
                    event.stopPropagation();
                    combobox.closeDropdown();
                    onChange?.(null);
                  }}
                />
              )
            }
          >
            <strong style={{ marginRight: 4 }}>{label}</strong> is{" "}
            {selectedLabel}
          </Button>
        </Combobox.Target>
        <Combobox.Dropdown bg="var(--mantine-color-body)">
          <Combobox.Options>{options}</Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </>
  );
};
