import { Button, SimpleGrid, Skeleton } from "@mantine/core";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import { CardTeam } from "./components/card-team";
import { DrawerUpsertTeam } from "./components/drawer-upsert-team";
import { useTeamsQuery } from "../../api/teams.api";
import { Breadcrumbs } from "../../components/breadcrumbs";
import { HeaderActions } from "../../components/header-actions";
import { PageEmptyState } from "../../components/page-empty-state";
import { useWorkspace } from "../../providers/workspace.provider";
import { PageContainer } from "../../components/page-container";
import { useContextualActions } from "../../providers/contextual-actions.provider";
import { IconCircles } from "@tabler/icons-react";

export const TeamsPage = () => {
  const [isDrawerOpen, drawerControl] = useDisclosure(false);
  const { workspace } = useWorkspace();
  const { data, isLoading } = useTeamsQuery({ workspaceId: workspace.id });

  useHotkeys([["n", drawerControl.open]]);
  useContextualActions({
    newTeam: {
      label: "New team",
      description: "Create a new team",
      icon: IconCircles,
      onClick: () => {
        drawerControl.open();
      },
    },
  });

  const teams = data?.workspace.teams;
  const hasTeams = teams && teams.length > 0;

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
      <SimpleGrid cols={{ base: 1, md: 3 }}>
        {isLoading && <PageSkeleton />}

        {!isLoading &&
          hasTeams &&
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

      {!isLoading && !hasTeams && (
        <PageEmptyState
          message="This workspace has no teams."
          action="New team"
          onClick={() => {
            drawerControl.open();
          }}
        />
      )}

      <DrawerUpsertTeam
        isOpen={isDrawerOpen}
        onClose={() => drawerControl.close()}
      />
    </PageContainer>
  );
};

const PageSkeleton = (): JSX.Element => (
  <>
    <Skeleton height={182} />
    <Skeleton height={182} />
    <Skeleton height={182} />
    <Skeleton height={182} />
  </>
);
