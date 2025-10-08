import { useState } from "react";
import { InputSelectAsync } from "../input-select-async";
import { InputSelectAsyncProps } from "../input-select-async/input-select-async";
import { usePersonAsyncOptions } from "../../providers/async-options.provider";
import { AvatarUser } from "../avatar-user";
import { Group } from "@mantine/core";
import { IconPeople } from "../../providers/icon.provider";

type InputSelectPersonProps = InputSelectAsyncProps;

export const InputSelectPerson = (
  props: Omit<InputSelectPersonProps, "memoizedItems" | "onDebouncedSearch">,
) => {
  const [search, setSearch] = useState("");

  const { options } = usePersonAsyncOptions({
    query: search,
    ids: props.value ? [props.value] : undefined,
  });

  return (
    <>
      <InputSelectAsync
        memoizedItems={options || []}
        onDebouncedSearch={setSearch}
        leftSection={props.value ? null : <IconPeople size={16} stroke={1.5} />}
        renderLabel={(item) => (
          <Group gap="xs" align="center">
            <AvatarUser
              src={typeof item.avatar === "string" ? item.avatar : null}
              name={item.label}
              size="xs"
            />
            {item.label}
          </Group>
        )}
        {...props}
      />
    </>
  );
};
