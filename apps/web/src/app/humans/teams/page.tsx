import { Button, Group, SimpleGrid, Skeleton } from "@mantine/core";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import { CardTeam } from "./components/card-team";
import { DrawerUpsertTeam } from "./components/drawer-upsert-team";
import { useTeamsQuery } from "../../../api/teams.api";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { HeaderActions } from "../../../components/header-actions";
import { PageEmptyState } from "../../../components/page-empty-state";
import { useWorkspace } from "../../../providers/workspace.provider";
import { PageContainer } from "../../../components/page-container";
import { useContextualActions } from "../../../providers/contextual-actions.provider";
import { IconTeam } from "../../../providers/icon.provider";
import {
  FilterOptions,
  FilterArchivedOnly,
} from "../../../components/filter-options";
import { useForm } from "@mantine/form";
import { useFilterSearchParameters } from "../../../providers/filter.provider";
import { LoadableContent } from "../../../components/loadable-content";

export const TeamsPage = () => {
  const [isDrawerOpen, drawerControl] = useDisclosure(false);
  const { workspace } = useWorkspace();
  const searchParams = useFilterSearchParameters();
  const filters = useForm<{
    archivedOnly: boolean;
  }>({
    initialValues: {
      archivedOnly: searchParams.get("archivedOnly") === "true",
    },
  });
  const { data, isLoading } = useTeamsQuery({
    workspaceId: workspace.id,
    input: {
      archivedOnly: filters.values.archivedOnly,
    },
  });

  useHotkeys([["n", drawerControl.open]]);
  useContextualActions({
    newTeam: {
      label: "New team",
      description: "Create a new team",
      icon: IconTeam,
      onClick: () => {
        drawerControl.open();
      },
    },
  });

  const teams = data?.workspace.teams;
  const hasTeams = teams && teams.length > 0;
  const isFiltering = Object.keys(searchParams.values).length > 0;

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Teams" }]} />
      <HeaderActions>
        <Button
          variant="light"
          onClick={() => {
            drawerControl.open();
          }}
        >
          New
        </Button>
      </HeaderActions>

      <Group>
        <FilterOptions>
          <FilterArchivedOnly
            checked={filters.values.archivedOnly}
            onChange={(value) => {
              filters.setFieldValue("archivedOnly", value);
              searchParams.set("archivedOnly", value ? "true" : null);
            }}
          />
        </FilterOptions>
      </Group>

      <LoadableContent
        mt="md"
        content={
          <SimpleGrid cols={{ base: 1, md: 3 }}>
            {hasTeams &&
              teams.map((team) => (
                <CardTeam
                  key={team.id}
                  id={team.id}
                  title={team.name}
                  description={team.description || ""}
                  startColor={team.startColor}
                  endColor={team.endColor}
                  iconEmoji={team.icon}
                  members={team.members.map((member) => ({
                    name: member.person?.name || member.person?.handle,
                    handle: member.person.handle,
                    avatar: member.person?.avatar || undefined,
                  }))}
                />
              ))}
          </SimpleGrid>
        }
        isLoading={isLoading}
        whenLoading={
          <SimpleGrid cols={{ base: 1, md: 3 }}>
            <Skeleton height={225} />
            <Skeleton height={225} />
            <Skeleton height={225} />
            <Skeleton height={225} />
          </SimpleGrid>
        }
        whenEmpty={
          <PageEmptyState
            message="This workspace has no teams."
            isFiltering={isFiltering}
            onResetFilter={() => {
              filters.setValues({ archivedOnly: false });
              searchParams.reset();
            }}
            action="New team"
            onClick={() => {
              drawerControl.open();
            }}
          />
        }
        isEmpty={!isLoading && !hasTeams}
      />

      <DrawerUpsertTeam
        isOpen={isDrawerOpen}
        onClose={() => drawerControl.close()}
      />
    </PageContainer>
  );
};
