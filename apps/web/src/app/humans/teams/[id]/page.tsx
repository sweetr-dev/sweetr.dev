import {
  Grid,
  Group,
  Stack,
  Title,
  Text,
  Skeleton,
  Badge,
  Box,
  Portal,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DrawerUpsertTeam } from "../components/drawer-upsert-team";
import { PageTitle } from "../../../../components/page-title";
import { Outlet } from "react-router-dom";
import { useTeamQuery } from "../../../../api/teams.api";
import { Breadcrumbs } from "../../../../components/breadcrumbs";
import { HeaderActions } from "../../../../components/header-actions";
import { MenuTeam } from "./components/menu-team";
import classes from "./page.module.css";
import { Team } from "@sweetr/graphql-types/frontend/graphql";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { IconPencil } from "@tabler/icons-react";
import { PageContainer } from "../../../../components/page-container";
import { useContextualActions } from "../../../../providers/contextual-actions.provider";
import { SubnavTeam } from "./components/subnav-team";
import { useTeamId } from "./use-team";

export const TeamPage = () => {
  const [isDrawerOpen, drawerControl] = useDisclosure(false);
  const teamId = useTeamId();
  const { workspace } = useWorkspace();

  useContextualActions({
    editTeam: {
      label: "Edit team",
      description: "Team details and members",
      icon: IconPencil,
      onClick: () => {
        drawerControl.open();
      },
    },
  });

  const { data, isLoading } = useTeamQuery(
    {
      teamId: teamId,
      workspaceId: workspace.id,
    },
    { enabled: !!teamId },
  );

  const team = data?.workspace.team;

  if (!team || isLoading) {
    return <PageSkeleton />;
  }

  const isArchived = !!team.archivedAt;

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "Teams", href: "/humans/teams" },
          { label: team.name },
        ]}
      />

      <HeaderActions>
        <MenuTeam
          teamId={team.id}
          isTeamArchived={isArchived}
          upsertDrawerControl={drawerControl}
        />
      </HeaderActions>

      <Portal target="#subnav">
        <SubnavTeam team={team} />
      </Portal>

      <PageTitle
        title={
          <Stack
            gap="xs"
            pl="lg"
            mb="xs"
            py={4}
            className={classes.header}
            style={{
              ["--startColor"]: team.startColor,
              ["--endColor"]: team.endColor,
            }}
          >
            <Group gap="xs" justify="space-between">
              <Group>
                <Title order={1} size="h2">
                  {team.name}
                </Title>

                <Text lh={1} fz={32}>
                  {team.icon}
                </Text>
              </Group>

              {isArchived && (
                <Badge variant="dot" color="dark">
                  Archived
                </Badge>
              )}
            </Group>
            {team.description}
          </Stack>
        }
      />

      <Box mt="md">
        <Outlet context={{ drawerControl }} />
      </Box>

      <DrawerUpsertTeam
        isOpen={isDrawerOpen}
        onClose={() => drawerControl.close()}
        team={team as Team}
      />
    </PageContainer>
  );
};

const PageSkeleton = (): JSX.Element => (
  <PageContainer>
    <Grid>
      <Grid.Col span={{ base: 12, md: 3 }}>
        <Skeleton height={20} />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 9 }}></Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Skeleton height={20} />
      </Grid.Col>
    </Grid>
    <Grid mt={26}>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Skeleton height={300} />
      </Grid.Col>
    </Grid>
  </PageContainer>
);

TeamPage.pageTitle = "Team";

export default TeamPage;
