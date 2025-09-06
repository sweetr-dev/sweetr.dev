import { Badge, NavLink, Stack, Text, useMantineTheme } from "@mantine/core";
import { Link } from "react-router-dom";
import { teamRoleColorMap } from "../../../../../../../providers/team-role.provider";
import { TeamMemberRole } from "@sweetr/graphql-types/frontend/graphql";

interface MenuTeamsProps {
  teams: {
    teamId: string;
    teamName: string;
    teamIcon: string;
    role: TeamMemberRole;
  }[];
}

export const MenuTeams = ({ teams }: MenuTeamsProps) => {
  const theme = useMantineTheme();

  return (
    <>
      <Stack gap="xs">
        {teams.map((team) => (
          <NavLink
            key={team.teamName}
            to={`/humans/teams/${team.teamId}`}
            component={Link}
            label={
              <Text fz="lg" lineClamp={1}>
                {team.teamName}
              </Text>
            }
            leftSection={<Text fz="xl">{team.teamIcon}</Text>}
            fw={600}
            style={{
              border: `1px solid ${theme.colors.dark[4]}`,
              borderRadius: theme.radius.md,
            }}
            rightSection={
              <Badge variant="light" color={teamRoleColorMap[team.role]}>
                {team.role}
              </Badge>
            }
          />
        ))}
      </Stack>

      {teams.length === 0 && (
        <Text c="dimmed" fz="sm">
          This person has not joined a team yet
        </Text>
      )}
    </>
  );
};
