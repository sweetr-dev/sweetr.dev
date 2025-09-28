import { useState } from "react";
import { InputSelectAsync } from "../input-select-async";
import { InputSelectAsyncProps } from "../input-select-async/input-select-async";
import { useApplicationAsyncOptions } from "../../providers/async-options.provider";
import { IconBox } from "@tabler/icons-react";

type InputSelectApplicationProps = InputSelectAsyncProps;

export const InputSelectApplication = (
  props: Omit<
    InputSelectApplicationProps,
    "memoizedItems" | "onDebouncedSearch"
  >,
) => {
  const [search, setSearch] = useState("");

  const { options } = useApplicationAsyncOptions({
    query: search,
    ids: props.value ? [props.value] : undefined,
  });

  return (
    <>
      <InputSelectAsync
        memoizedItems={options || []}
        onDebouncedSearch={setSearch}
        leftSection={<IconBox size={16} stroke={1.5} />}
        {...props}
      />
    </>
  );
};
