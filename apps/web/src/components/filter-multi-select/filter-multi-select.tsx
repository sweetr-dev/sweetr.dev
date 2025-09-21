import {
  Button,
  Combobox,
  useCombobox,
  Checkbox,
  Group,
  CloseButton,
  Loader,
  Text,
} from "@mantine/core";
import { IconProps } from "@tabler/icons-react";
import { useState } from "react";
import {
  FilterOption,
  UseAsyncFilterHook,
} from "../../providers/filter.provider";
import { useDebouncedValue } from "@mantine/hooks";
import { useSeenOptionsCache } from "./use-seen-options-cache";
import { capitalize as capitalizeFn } from "radash";
import { DEFAULT_MAX_OPTIONS } from "../../providers/async-options.provider";

interface FilterMultiSelectProps {
  label: string;
  icon: React.ComponentType<IconProps>;
  items?: FilterOption[];
  onChange?: (value: string[]) => void;
  asyncController?: UseAsyncFilterHook;
  value: string[];
  withSearch?: boolean;
  width?: number | "target";
  capitalize?: boolean;
}

export const FilterMultiSelect = ({
  label,
  icon: Icon,
  items: initialItems = [],
  asyncController,
  onChange,
  value,
  withSearch,
  width = 300,
  capitalize = true,
}: FilterMultiSelectProps) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => {
      if (withSearch) {
        combobox.focusSearchInput();
      }

      combobox.updateSelectedOptionIndex("active");
    },
  });

  const [search, setSearch] = useState("");
  const [query] = useDebouncedValue(search, 200, { leading: true });

  const controller = asyncController?.({
    query: query,
    ids: value,
  });

  const seenOptions = useSeenOptionsCache({
    memoizedItems: controller?.options || initialItems || [],
  });

  const selectedItems = value.map((v) => seenOptions[v]).filter(Boolean);

  const items = controller?.options || initialItems;

  const selectedValues = selectedItems.map((item) => item.value);

  const handleValueSelect = (val: string) => {
    const isUnchecking = selectedItems.some((item) => item.value === val);

    const newSelectedItems = isUnchecking
      ? selectedItems.filter((item) => item.value !== val)
      : [...selectedItems, seenOptions[val]];

    onChange?.(newSelectedItems.map((item) => item.value));
  };

  const getLabel = (item: FilterOption) => {
    return capitalize ? capitalizeFn(item.label) : item.label;
  };

  const getOption = (item: FilterOption) => {
    return (
      <Combobox.Option
        value={item.value}
        key={item.value}
        active={selectedValues.includes(item.value)}
      >
        <Group gap="sm" wrap="nowrap">
          <Checkbox
            checked={selectedValues.includes(item.value)}
            onChange={() => {}}
            aria-hidden
            size="xs"
            tabIndex={-1}
            style={{ pointerEvents: "none" }}
          />
          <Group gap={5} wrap="nowrap">
            <>
              {item.icon && <div>{item.icon}</div>}
              {getLabel(item)}
            </>
          </Group>
        </Group>
      </Combobox.Option>
    );
  };

  const selectedOptions = selectedItems.map(getOption);
  const remainingOptions = items
    .filter((item) => !selectedItems.includes(item))
    .map(getOption);
  const allOptions = [...selectedOptions, ...remainingOptions];

  const selectedLabel = selectedItems.length
    ? selectedItems
        .map((item) => [item.icon, getLabel(item)].filter(Boolean).join(" "))
        .join(", ")
    : "any";

  return (
    <>
      <Combobox
        store={combobox}
        withinPortal={false}
        onOptionSubmit={handleValueSelect}
        position="bottom-start"
        width={width}
      >
        <Combobox.Target targetType="button">
          <Button
            color="var(--mantine-color-body)"
            leftSection={<Icon size={16} />}
            style={{
              fontWeight: 400,
              border:
                "calc(.0625rem*var(--mantine-scale)) solid var(--mantine-color-dark-4)",
              overflowX: "auto",
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
        <Combobox.Dropdown
          bg="var(--mantine-color-body)"
          mah={400}
          style={{ overflowY: "auto" }}
        >
          {withSearch && (
            <Combobox.Search
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Search"
            />
          )}
          <Combobox.Options>
            {selectedOptions.length > 0 && selectedOptions}
            {remainingOptions.length > 0 && remainingOptions}

            {allOptions.length === 0 && controller?.isLoading && (
              <Combobox.Empty>
                <Group justify="center" align="center" gap="xs">
                  <Loader size="sm" type="dots" color="green.4" />
                  Loading
                </Group>
              </Combobox.Empty>
            )}
            {allOptions.length === 0 && !controller?.isLoading && (
              <Combobox.Empty>Nothing found</Combobox.Empty>
            )}
          </Combobox.Options>

          {allOptions.length >= DEFAULT_MAX_OPTIONS && (
            <Combobox.Footer>
              <Text fz="xs" c="dimmed">
                Showing limited results. Search to see more.
              </Text>
            </Combobox.Footer>
          )}
        </Combobox.Dropdown>
      </Combobox>
    </>
  );
};
