import {
  Grid,
  Group,
  Paper,
  Stack,
  Title,
  Text,
  Skeleton,
  Badge,
  Tabs,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DrawerUpsertTeam } from "../components/drawer-upsert-team";
import { PageTitle } from "../../../components/page-title";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTeamQuery } from "../../../api/teams.api";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { HeaderActions } from "../../../components/header-actions";
import { MenuTeam } from "./components/menu-team";
import classes from "./page.module.css";
import { Team } from "@sweetr/graphql-types/frontend/graphql";
import { useWorkspace } from "../../../providers/workspace.provider";
import {
  IconChartArcs,
  IconGitPullRequest,
  IconPencil,
  IconUsers,
} from "@tabler/icons-react";
import { PageContainer } from "../../../components/page-container";
import { ResourceNotFound } from "../../../exceptions/resource-not-found.exception";
import { useContextualActions } from "../../../providers/contextual-actions.provider";

export const TeamPage = () => {
  const [isDrawerOpen, drawerControl] = useDisclosure(false);
  const { teamId } = useParams();
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!teamId) throw new ResourceNotFound();

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

  const getActiveTab = () => {
    const basePath = `/teams/${teamId}/`;

    if (pathname === basePath) return "members";

    return [`pull-requests`, `code-reviews`, `health-and-performance`].find(
      (path) => pathname.includes(basePath + path),
    );
  };

  const navigateTo = (path: string) => navigate(`/teams/${team.id}/${path}`);

  const handleChangeTab = (tab: string | null) => {
    if (!tab || tab === "members") return navigateTo("");

    return navigateTo(tab);
  };

  return (
    <PageContainer>
      <Breadcrumbs
        items={[{ label: "Teams", href: "/teams" }, { label: team.name }]}
      />

      <HeaderActions>
        <MenuTeam
          teamId={team.id}
          isTeamArchived={isArchived}
          upsertDrawerControl={drawerControl}
        />
      </HeaderActions>

      <PageTitle
        title={
          <Stack
            gap="xs"
            pl="lg"
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

      <Paper radius="sm">
        <Tabs
          value={getActiveTab()}
          defaultValue="members"
          radius="none"
          variant="default"
          onChange={handleChangeTab}
        >
          <Tabs.List>
            <Tabs.Tab
              value="members"
              onClick={() => navigateTo("")}
              leftSection={<IconUsers size={24} stroke={1.5} />}
            >
              Members
            </Tabs.Tab>
            <Tabs.Tab
              value="pull-requests"
              onClick={() => navigateTo("pull-requests")}
              leftSection={<IconGitPullRequest size={24} stroke={1.5} />}
            >
              Pull Requests
            </Tabs.Tab>
            <Tabs.Tab
              value="health-and-performance"
              onClick={() => navigateTo("health-and-performance")}
              leftSection={<IconChartArcs size={24} stroke={1.5} />}
            >
              Health & Performance
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Paper>

      <Box mt="xl">
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
