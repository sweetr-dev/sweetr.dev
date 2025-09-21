import {
  CheckIcon,
  CloseButton,
  Combobox,
  Group,
  Input,
  InputBase,
  InputBaseProps,
  Loader,
  Text,
  useCombobox,
} from "@mantine/core";
import { useState, ReactNode, useEffect } from "react";
import { useWorkspace } from "../../providers/workspace.provider";
import { useTeamOptionsQuery } from "../../api/teams.api";
import { useDebouncedValue } from "@mantine/hooks";
import { useSeenOptionsCache } from "../filter-multi-select/use-seen-options-cache";
import { DEFAULT_MAX_OPTIONS } from "../../providers/async-options.provider";

type Item = {
  label: string;
  value: string;
  [key: string]: string | ReactNode | undefined;
};

export interface InputSelectAsyncProps extends InputBaseProps {
  value?: string;
  onChange: (value: string) => void;
  memoizedItems: Item[];
  onDebouncedSearch: (query: string) => void;
  renderLabel?: (item: Item) => string | ReactNode;
  clearable?: boolean;
  placeholder?: string;
}

export const InputSelectAsync = ({
  value = "",
  onChange,
  memoizedItems = [],
  onDebouncedSearch,
  renderLabel,
  clearable = false,
  ...props
}: InputSelectAsyncProps) => {
  const { workspace } = useWorkspace();
  const [search, setSearch] = useState("");
  const [query] = useDebouncedValue(search, 200, { leading: true });

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      combobox.focusTarget();
      setSearch("");
    },

    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        combobox.selectActiveOption();
      } else {
        combobox.updateSelectedOptionIndex("active");
      }

      combobox.focusSearchInput();
    },
  });

  const { data, isFetching } = useTeamOptionsQuery({
    workspaceId: workspace.id,
    input: {
      query,
      limit: DEFAULT_MAX_OPTIONS,
    },
  });

  const seenOptions = useSeenOptionsCache({
    memoizedItems,
  });

  const selectedOption = seenOptions[value];

  const options = memoizedItems.map((item) => (
    <Combobox.Option
      value={item.value}
      key={item.value}
      active={item.value === value}
    >
      <Group gap="xs">
        {item.value === value && <CheckIcon size={12} />}
        <span>{renderLabel ? renderLabel(item) : item.label}</span>
      </Group>
    </Combobox.Option>
  ));

  useEffect(() => {
    onDebouncedSearch(query);
  }, [query, onDebouncedSearch]);

  return (
    <>
      <Combobox
        withinPortal={false}
        store={combobox}
        onOptionSubmit={(val) => {
          onChange?.(val);
          combobox.closeDropdown();
          combobox.updateSelectedOptionIndex("active");
        }}
      >
        <Combobox.Target>
          <InputBase
            component="button"
            type="button"
            pointer
            rightSection={
              value !== null && clearable ? (
                <CloseButton
                  size="sm"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onChange("")}
                  aria-label="Clear value"
                />
              ) : (
                <Combobox.Chevron />
              )
            }
            rightSectionPointerEvents={
              value === null && clearable ? "none" : "all"
            }
            onClick={() => combobox.toggleDropdown()}
            value={value || ""}
            {...props}
          >
            {selectedOption ? (
              <>
                {selectedOption?.icon} {selectedOption?.label}
              </>
            ) : (
              <Input.Placeholder>{props.placeholder}</Input.Placeholder>
            )}
          </InputBase>
        </Combobox.Target>

        <Combobox.Dropdown
          hidden={data === null}
          mah={295}
          style={{ overflowY: "auto" }}
        >
          <Combobox.Search
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Search"
          />
          <Combobox.Options>
            {options}
            {options.length === 0 && isFetching && (
              <Combobox.Empty>
                <Group justify="center" align="center" gap="xs">
                  <Loader size="sm" type="dots" color="green.4" />
                  Loading
                </Group>
              </Combobox.Empty>
            )}
            {options.length === 0 && !isFetching && (
              <Combobox.Empty>Nothing found</Combobox.Empty>
            )}
          </Combobox.Options>

          {options.length >= DEFAULT_MAX_OPTIONS && (
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
