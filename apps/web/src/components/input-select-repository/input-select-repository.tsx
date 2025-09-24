import { useState } from "react";
import { InputSelectAsync } from "../input-select-async";
import { InputSelectAsyncProps } from "../input-select-async/input-select-async";
import { useRepositoryAsyncOptions } from "../../providers/async-options.provider";
import { IconRepository } from "../../providers/icon.provider";

type InputSelectRepositoryProps = InputSelectAsyncProps;

export const InputSelectRepository = (
  props: Omit<
    InputSelectRepositoryProps,
    "memoizedItems" | "onDebouncedSearch"
  >,
) => {
  const [search, setSearch] = useState("");

  const { options } = useRepositoryAsyncOptions({
    query: search,
    ids: props.value ? [props.value] : undefined,
  });

  return (
    <>
      <InputSelectAsync
        memoizedItems={options || []}
        onDebouncedSearch={setSearch}
        leftSection={<IconRepository size={16} stroke={1.5} />}
        {...props}
      />
    </>
  );
};
