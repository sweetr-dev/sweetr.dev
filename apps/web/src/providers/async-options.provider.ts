import { unique } from "radash";
import { useEffect, useMemo } from "react";
import { useRepositoriesQuery } from "../api/repositories.api";
import { UseAsyncFilterHook } from "./filter.provider";
import { useWorkspace } from "./workspace.provider";
import { useTeamOptionsQuery } from "../api/teams.api";
import { useApplicationOptionsQuery } from "../api/applications.api";
import { useRunOnce } from "./run-once.provider";

export const DEFAULT_MAX_OPTIONS = 10;

export const useTeamAsyncOptions: UseAsyncFilterHook = ({ query, ids }) => {
  const { workspace } = useWorkspace();
  const [hasPrefetchedOptions, markPrefetchDone] = useRunOnce();

  const { data, isLoading, refetch } = useTeamOptionsQuery(
    {
      input: {
        query,
        limit: DEFAULT_MAX_OPTIONS,
      },
      workspaceId: workspace?.id,
    },
    {},
  );

  const { data: selectedData, refetch: prefetchSelectedOptions } =
    useTeamOptionsQuery(
      {
        input: {
          ids,
        },
        workspaceId: workspace?.id,
      },
      {
        enabled: false,
      },
    );

  useEffect(() => {
    if (!hasPrefetchedOptions && ids?.length) {
      prefetchSelectedOptions();
      markPrefetchDone();
    }
  }, [
    hasPrefetchedOptions,
    prefetchSelectedOptions,
    ids?.length,
    markPrefetchDone,
  ]);

  const options = useMemo(() => {
    const searchedOptions = data?.workspace.teams || [];
    const selectedOptions = selectedData?.workspace.teams || [];

    const options = unique(
      [...selectedOptions, ...searchedOptions],
      (option) => option.id,
    );

    return options.map((option) => ({
      label: option.name,
      value: option.id,
      icon: option.icon,
    }));
  }, [data?.workspace.teams, selectedData?.workspace.teams]);

  return useMemo(
    () => ({
      options,
      isLoading,
      refetch,
    }),
    [options, isLoading, refetch],
  );
};

export const useRepositoryAsyncOptions: UseAsyncFilterHook = ({
  query,
  ids,
}) => {
  const { workspace } = useWorkspace();
  const [hasPrefetchedOptions, markPrefetchDone] = useRunOnce();
  const { data, isLoading, refetch } = useRepositoriesQuery({
    input: {
      query,
      limit: DEFAULT_MAX_OPTIONS,
    },
    workspaceId: workspace?.id,
  });

  const { data: selectedData, refetch: prefetchSelectedOptions } =
    useRepositoriesQuery(
      {
        input: {
          ids,
        },
        workspaceId: workspace?.id,
      },
      {
        enabled: false,
      },
    );

  useEffect(() => {
    if (!hasPrefetchedOptions && ids?.length) {
      prefetchSelectedOptions();
      markPrefetchDone();
    }
  }, [
    hasPrefetchedOptions,
    prefetchSelectedOptions,
    ids?.length,
    markPrefetchDone,
  ]);

  const options = useMemo(() => {
    const searchedOptions = data?.workspace.repositories || [];
    const selectedOptions = selectedData?.workspace.repositories || [];

    const options = unique(
      [...selectedOptions, ...searchedOptions],
      (option) => option.id,
    );

    return options.map((option) => ({
      label: option.name,
      value: option.id,
    }));
  }, [data?.workspace.repositories, selectedData?.workspace.repositories]);

  return useMemo(
    () => ({
      options,
      isLoading,
      refetch,
    }),
    [options, isLoading, refetch],
  );
};

export const useApplicationAsyncOptions: UseAsyncFilterHook = ({
  query,
  ids,
}) => {
  const { workspace } = useWorkspace();
  const [hasPrefetchedOptions, markPrefetchDone] = useRunOnce();

  const { data, isLoading, refetch } = useApplicationOptionsQuery({
    input: {
      query,
      limit: DEFAULT_MAX_OPTIONS,
    },
    workspaceId: workspace?.id,
  });

  const { data: selectedData, refetch: prefetchSelectedOptions } =
    useApplicationOptionsQuery(
      {
        input: {
          ids,
        },
        workspaceId: workspace?.id,
      },
      {
        enabled: false,
      },
    );

  useEffect(() => {
    if (!hasPrefetchedOptions && ids?.length) {
      prefetchSelectedOptions();
      markPrefetchDone();
    }
  }, [
    hasPrefetchedOptions,
    prefetchSelectedOptions,
    ids?.length,
    markPrefetchDone,
  ]);

  const options = useMemo(() => {
    const searchedOptions = data?.workspace.applications || [];
    const selectedOptions = selectedData?.workspace.applications || [];

    const options = unique(
      [...selectedOptions, ...searchedOptions],
      (option) => option.id,
    );

    return options.map((option) => ({
      label: option.name,
      value: option.id,
    }));
  }, [data?.workspace.applications, selectedData?.workspace.applications]);

  return useMemo(
    () => ({
      options,
      isLoading,
      refetch,
    }),
    [options, isLoading, refetch],
  );
};
