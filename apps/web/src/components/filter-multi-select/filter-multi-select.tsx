import {
  Button,
  Combobox,
  useCombobox,
  Checkbox,
  Group,
  CloseButton,
} from "@mantine/core";

interface FilterMultiSelectProps {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  items: string[];
  initialValue?: string[];
  onChange?: (value: string[]) => void;
  value: string[];
}

export const FilterMultiSelect = ({
  label,
  icon: Icon,
  items,
  onChange,
  value: selectedItems,
}: FilterMultiSelectProps) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const handleValueSelect = (val: string) => {
    const newValue = selectedItems.includes(val)
      ? selectedItems.filter((v) => v !== val)
      : [...selectedItems, val];

    onChange?.(newValue);
  };

  const options = items.map((item) => (
    <Combobox.Option
      value={item}
      key={item}
      active={selectedItems.includes(item)}
    >
      <Group gap="sm">
        <Checkbox
          checked={selectedItems.includes(item)}
          onChange={() => {}}
          aria-hidden
          size="xs"
          tabIndex={-1}
          style={{ pointerEvents: "none" }}
        />
        <span style={{ textTransform: "capitalize" }}>
          {item.toLowerCase()}
        </span>
      </Group>
    </Combobox.Option>
  ));

  const selectedLabel = selectedItems.length
    ? selectedItems.join(", ").toLowerCase()
    : "any";

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
              selectedItems.length > 0 && (
                <CloseButton
                  size="xs"
                  aria-label="Clear filter"
                  onClick={(event) => {
                    event.stopPropagation();
                    combobox.closeDropdown();
                    onChange?.([]);
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
