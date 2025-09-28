import { useState } from "react";
import { InputSelectAsync } from "../input-select-async";
import { InputSelectAsyncProps } from "../input-select-async/input-select-async";
import { useDeploymentAsyncOptions } from "../../providers/async-options.provider";
import { IconDeployment } from "../../providers/icon.provider";

type InputSelectDeploymentProps = InputSelectAsyncProps & {
  applicationIds?: string[];
};

export const InputSelectDeployment = (
  props: Omit<
    InputSelectDeploymentProps,
    "memoizedItems" | "onDebouncedSearch"
  >,
) => {
  const [search, setSearch] = useState("");

  const { options } = useDeploymentAsyncOptions({
    query: search,
    ids: props.value ? [props.value] : undefined,
    applicationIds: props.applicationIds,
  });

  return (
    <>
      <InputSelectAsync
        memoizedItems={options || []}
        onDebouncedSearch={setSearch}
        leftSection={<IconDeployment size={16} stroke={1.5} />}
        {...props}
      />
    </>
  );
};
