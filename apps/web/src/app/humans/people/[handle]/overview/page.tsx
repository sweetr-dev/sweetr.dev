import { Paper, Grid, Skeleton } from "@mantine/core";
import { PaperTitle } from "../../../../../components/paper-title";
import { usePersonQuery } from "../../../../../api/people.api";
import { useParams } from "react-router-dom";
import { MenuTeams } from "./components/menu-teams";
import { useWorkspace } from "../../../../../providers/workspace.provider";
import { ResourceNotFound } from "../../../../../exceptions/resource-not-found.exception";

export const PersonOverviewPage = () => {
  const { handle } = useParams();
  const { workspace } = useWorkspace();

  if (!handle) throw new ResourceNotFound();

  const { data, isLoading } = usePersonQuery(
    { workspaceId: workspace.id, handle },
    { enabled: !!workspace.id },
  );
  const teamMemberships = data?.workspace.person?.teamMemberships || [];

  if (isLoading) {
    return (
      <>
        <Skeleton height={182} />
        <Skeleton height={182} mt="md" />
      </>
    );
  }

  return (
    <Grid>
      <Grid.Col span={6}>
        {/* <Paper p="md" radius="md" withBorder>
          <PaperTitle>Information</PaperTitle>
          <Stack gap="xs">
            <div>
              <strong>Bio:</strong> Passionate about building products 🚀
            </div>
            <div>
              <strong>Joined at:</strong> April 9th, 2022
            </div>
            <div>
              <strong>Works from:</strong> Vancouver, PST timezone
            </div>
          </Stack>
        </Paper> */}

        <Paper p="md" radius="md" withBorder mt="md">
          <PaperTitle>Teams</PaperTitle>

          <MenuTeams
            teams={teamMemberships?.map((membership) => ({
              teamId: membership.team.id,
              teamName: membership.team.name,
              teamIcon: membership.team.icon,
              role: membership.role,
            }))}
          />
        </Paper>
      </Grid.Col>
    </Grid>
  );
};
