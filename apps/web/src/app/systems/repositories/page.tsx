import { Anchor, Box, Skeleton, Stack } from "@mantine/core";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { CardRepository } from "./components/card-repository";
import { useRepositoriesQuery } from "../../../api/repositories.api";
import { IconInfo } from "../../../components/icon-info";
import { HeaderActions } from "../../../components/header-actions";
import { InputSearch } from "../../../components/input-search";
import { PageEmptyState } from "../../../components/page-empty-state";
import { useWorkspace } from "../../../providers/workspace.provider";
import { PageContainer } from "../../../components/page-container";

export const RepositoriesPage = () => {
  const { workspace } = useWorkspace();
  const { data, isLoading } = useRepositoriesQuery(
    { workspaceId: workspace.id },
    { enabled: !!workspace.id },
  );

  const repositories = data?.workspace.repositories;
  const breadcrumbs = (
    <Breadcrumbs items={[{ label: "Repositories" }]}>
      <IconInfo tooltip="This is a read-only list for now. We'll introduce repository insights soon." />
    </Breadcrumbs>
  );

  if (isLoading || !repositories) {
    return (
      <PageContainer>
        {breadcrumbs}
        <Stack>
          <Skeleton height={48} />
          <Skeleton height={48} />
          <Skeleton height={48} />
          <Skeleton height={48} />
          <Skeleton height={48} />
        </Stack>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {breadcrumbs}

      <HeaderActions>
        <InputSearch />
      </HeaderActions>

      <Stack>
        {repositories.length === 0 && (
          <Box mt={100}>
            <PageEmptyState message="No repositories found." />
          </Box>
        )}
        {repositories.map((repository) => (
          <Anchor
            href={`https://github.com/${repository.fullName}`}
            target="_blank"
            rel="noreferrer"
            key={repository.id}
            underline="never"
            c="dark.0"
          >
            <CardRepository name={repository.name} />
          </Anchor>
        ))}
      </Stack>
    </PageContainer>
  );
};
