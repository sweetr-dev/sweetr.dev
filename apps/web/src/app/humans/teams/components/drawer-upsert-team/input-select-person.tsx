import { useEffect, useMemo, useState } from "react";
import {
  Combobox,
  useCombobox,
  ComboboxProps,
  Button,
  Group,
  Text,
  Loader,
  ScrollArea,
} from "@mantine/core";
import { usePeopleOptionsQuery } from "../../../../../api/people.api";
import { useDebouncedValue } from "@mantine/hooks";
import { PersonData } from "./types";
import { useWorkspace } from "../../../../../providers/workspace.provider";
import { AvatarUser } from "../../../../../components/avatar-user";

interface InputSelectPersonProps extends ComboboxProps {
  onSubmit: (person: PersonData) => void;
  hidePeople: string[];
}

export const InputSelectPerson = ({
  onSubmit,
  hidePeople,
  ...props
}: InputSelectPersonProps) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 200, { leading: true });
  const { workspace } = useWorkspace();

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      combobox.focusTarget();
      setSearch("");
    },
    onDropdownOpen: () => {
      combobox.focusSearchInput();
    },
  });

  const handleOptionSubmit = (personId: string) => {
    combobox.closeDropdown();

    const person = people.find((person) => person.id === personId);

    if (person) onSubmit(person);
  };

  const { data, isLoading, refetch } = usePeopleOptionsQuery({
    workspaceId: workspace.id,
    input: { query: debouncedSearch },
  });

  const people = useMemo(
    () =>
      data?.workspace.people.filter(
        (person) => !hidePeople.includes(person.id),
      ) || [],
    [data, hidePeople],
  );

  const options = people.map((person) => (
    <Combobox.Option value={person.id} key={person.id}>
      <Group justify="space-between">
        <Group>
          <AvatarUser src={person.avatar} name={person.name} />
          <Text>{person.name}</Text>
        </Group>
        <Text size="xs">@{person.handle}</Text>
      </Group>
    </Combobox.Option>
  ));

  useEffect(() => {
    combobox.resetSelectedOption();

    if (people.length === 1) combobox.selectFirstOption();
  }, [combobox, people]);

  useEffect(() => {
    if (debouncedSearch) refetch();
  }, [debouncedSearch, refetch]);

  return (
    <Combobox
      variant="filled"
      onOptionSubmit={handleOptionSubmit}
      store={combobox}
      position="top-start"
      withinPortal={false}
      {...props}
    >
      <Combobox.Target>
        <Button
          fullWidth
          variant="default"
          color="green"
          onClick={() => combobox.toggleDropdown()}
        >
          Add member
        </Button>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Search
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder="Search by name or git handle."
        />
        <Combobox.Options>
          <ScrollArea.Autosize type="scroll" mah={225}>
            {isLoading && (
              <Combobox.Empty>
                <Group justify="center" align="center" gap="xs">
                  <Loader size="sm" type="dots" color="green.4" />
                  Loading
                </Group>
              </Combobox.Empty>
            )}
            {!isLoading && options.length === 0 && (
              <Combobox.Empty>Nothing found</Combobox.Empty>
            )}
            {options?.length > 0 && options}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
