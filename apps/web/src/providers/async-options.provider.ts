import { unique } from "radash";
import { useEffect, useMemo } from "react";
import { useRepositoriesQuery } from "../api/repositories.api";
import { UseAsyncFilterHook } from "./filter.provider";
import { useWorkspace } from "./workspace.provider";
import { useTeamOptionsQuery } from "../api/teams.api";
import { useApplicationOptionsQuery } from "../api/applications.api";
import { useRunOnce } from "./run-once.provider";
import { useEnvironmentOptionsQuery } from "../api/environments.api";
import { usePeopleOptionsQuery } from "../api/people.api";
import { useDeploymentOptionsQuery } from "../api/deployments.api";
import { formatLocaleDate } from "./date.provider";
import { parseISO } from "date-fns";
import { formatDeploymentVersion } from "./deployment.provider";

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
      teamId: option.team?.id,
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

export const useEnvironmentAsyncOptions: UseAsyncFilterHook = ({
  query,
  ids,
}) => {
  const { workspace } = useWorkspace();
  const [hasPrefetchedOptions, markPrefetchDone] = useRunOnce();

  const { data, isLoading, refetch } = useEnvironmentOptionsQuery({
    input: {
      query,
      limit: DEFAULT_MAX_OPTIONS,
    },
    workspaceId: workspace?.id,
  });

  const { data: selectedData, refetch: prefetchSelectedOptions } =
    useEnvironmentOptionsQuery(
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
    const searchedOptions = data?.workspace.environments || [];
    const selectedOptions = selectedData?.workspace.environments || [];

    const options = unique(
      [...selectedOptions, ...searchedOptions],
      (option) => option.id,
    );

    return options.map((option) => ({
      label: option.name,
      value: option.id,
    }));
  }, [data?.workspace.environments, selectedData?.workspace.environments]);

  return useMemo(
    () => ({
      options,
      isLoading,
      refetch,
    }),
    [options, isLoading, refetch],
  );
};

export const usePersonAsyncOptions: UseAsyncFilterHook = ({ query, ids }) => {
  const { workspace } = useWorkspace();
  const [hasPrefetchedOptions, markPrefetchDone] = useRunOnce();

  const { data, isLoading, refetch } = usePeopleOptionsQuery({
    workspaceId: workspace.id,
    input: { query },
  });

  const { data: selectedData, refetch: prefetchSelectedOptions } =
    usePeopleOptionsQuery(
      {
        workspaceId: workspace.id,
        input: { ids },
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
    const searchedOptions = data?.workspace.people || [];
    const selectedOptions = selectedData?.workspace.people || [];

    const options = unique(
      [...selectedOptions, ...searchedOptions],
      (option) => option.id,
    );

    return options.map((option) => ({
      label: option.name || option.handle,
      value: option.id,
      avatar: option.avatar,
    }));
  }, [data?.workspace.people, selectedData?.workspace.people]);

  return useMemo(
    () => ({
      options,
      isLoading,
      refetch,
    }),
    [options, isLoading, refetch],
  );
};

export const useDeploymentAsyncOptions = ({
  query,
  ids,
  applicationIds,
  deployedAt,
}: {
  query?: string;
  ids?: string[];
  applicationIds?: string[];
  deployedAt?: { from: string; to: string };
}) => {
  const { workspace } = useWorkspace();
  const [hasPrefetchedOptions, markPrefetchDone] = useRunOnce();

  const { data, isLoading, refetch } = useDeploymentOptionsQuery({
    input: {
      query,
      limit: DEFAULT_MAX_OPTIONS,
      applicationIds,
      deployedAt,
    },
    workspaceId: workspace.id,
  });

  const { data: selectedData, refetch: prefetchSelectedOptions } =
    useDeploymentOptionsQuery(
      {
        input: {
          ids,
          applicationIds,
        },
        workspaceId: workspace.id,
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
    const searchedOptions = data?.workspace.deployments || [];
    const selectedOptions = selectedData?.workspace.deployments || [];

    const options = unique(
      [...selectedOptions, ...searchedOptions],
      (option) => option.id,
    );

    return options.map((option) => ({
      label: `${formatDeploymentVersion(option.version)} • ${formatLocaleDate(
        parseISO(option.deployedAt as string),
        {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        },
      )}`,
      value: option.id,
      deployedAt: option.deployedAt,
    }));
  }, [data?.workspace.deployments, selectedData?.workspace.deployments]);

  return useMemo(
    () => ({
      options,
      isLoading,
      refetch,
    }),
    [options, isLoading, refetch],
  );
};
