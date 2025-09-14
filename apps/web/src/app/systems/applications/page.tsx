import { Box, Button, Group, Skeleton, Stack } from "@mantine/core";
import { IconCircles } from "@tabler/icons-react";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { FilterMultiSelect } from "../../../components/filter-multi-select";
import { LoadableContent } from "../../../components/loadable-content";
import { PageContainer } from "../../../components/page-container";
import { PageEmptyState } from "../../../components/page-empty-state";
import { CardApplication } from "./components/card-application";
import { HeaderActions } from "../../../components/header-actions";

export const ApplicationsPage = () => {
  const searchParams = { hasAny: false };
  const applications = [
    {
      id: "1",
      name: "www.sweetr.dev",
      repository: {
        name: "www.sweetr.dev",
      },
      team: {
        name: "Growth",
        icon: "🚀",
      },
      lastDeployment: {
        version: "0b52d613f2a8a31bd100776cd425d261ed7dc261",
        deployedAt: "2025-09-12 12:35:13",
      },
    },

    {
      id: "2",
      name: "api",
      repository: {
        name: "sweetr",
      },
      team: {
        name: "Growth",
        icon: "🚀",
      },
      lastDeployment: {
        version: "0b52d613f2a8a31bd100776cd425d261ed7dc261",
        deployedAt: "2025-09-12 12:35:13",
      },
    },

    {
      id: "3",
      name: "email",
      repository: {
        name: "sweetr",
      },
      team: {
        name: "Core",
        icon: "⚡",
      },
      lastDeployment: {
        version: "0b52d613f2a8a31bd100776cd425d261ed7dc261",
        deployedAt: "2025-09-12 12:35:13",
      },
    },

    {
      id: "3",
      name: "data-sync",
      repository: {
        name: "sweetr",
      },
      team: {
        name: "Core",
        icon: "⚡",
      },
      lastDeployment: {
        version: "0b52d613f2a8a31bd100776cd425d261ed7dc261",
        deployedAt: "2025-09-12 12:35:13",
      },
    },
  ];

  const isLoading = false;
  const isEmpty = false;

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Applications" }]} />

      <HeaderActions>
        <Button
          variant="light"
          onClick={() => {
            alert("TO-DO");
          }}
        >
          New
        </Button>
      </HeaderActions>

      <Group gap={5}>
        <FilterMultiSelect
          label="Owner"
          icon={IconCircles}
          items={["Growth", "Core", "Marketing"]}
          value={[]}
        />
      </Group>

      <LoadableContent
        mt="md"
        isLoading={isLoading}
        isEmpty={isEmpty}
        whenLoading={
          <Stack>
            <Skeleton height={20} />
            <Skeleton height={85} />
            <Skeleton height={85} />
            <Skeleton height={85} />
            <Skeleton height={85} />
            <Skeleton height={85} />
            <Skeleton height={85} />
          </Stack>
        }
        whenEmpty={
          <Box mt={80}>
            <PageEmptyState
              message="No deployments found."
              isFiltering={searchParams.hasAny}
              onResetFilter={() => {
                // Reset filters logic would go here
              }}
            />
          </Box>
        }
        content={
          <Box
            display="grid"
            style={{
              gridTemplateColumns: "auto auto auto",
              justifyContent: "space-between",
              gap: "var(--stack-gap, var(--mantine-spacing-md))",
            }}
            mt="md"
          >
            {applications?.map((application) => (
              <CardApplication key={application.id} application={application} />
            ))}
          </Box>
        }
      />
    </PageContainer>
  );
};
