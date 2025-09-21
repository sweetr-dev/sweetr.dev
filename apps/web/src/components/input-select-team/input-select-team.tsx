import { useState } from "react";
import { IconCircles } from "@tabler/icons-react";
import { InputSelectAsync } from "../input-select-async";
import { InputSelectAsyncProps } from "../input-select-async/input-select-async";
import { useTeamAsyncOptions } from "../../providers/async-options.provider";

type InputSelectTeamProps = InputSelectAsyncProps;

export const InputSelectTeam = (
  props: Omit<InputSelectTeamProps, "memoizedItems" | "onDebouncedSearch">,
) => {
  const [search, setSearch] = useState("");

  const { options } = useTeamAsyncOptions({
    query: search,
    ids: props.value ? [props.value] : undefined,
  });

  return (
    <>
      <InputSelectAsync
        memoizedItems={options || []}
        onDebouncedSearch={setSearch}
        leftSection={<IconCircles size={16} stroke={1.5} />}
        renderLabel={(item) => `${item.icon} ${item.label}`}
        {...props}
      />
    </>
  );
};
