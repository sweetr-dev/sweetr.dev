import {
  Avatar,
  Badge,
  Group,
  Paper,
  Stack,
  Text,
  Box,
  Anchor,
} from "@mantine/core";
import { TeamMemberRole } from "@sweetr/graphql-types/frontend/graphql";
import { teamRoleColorMap } from "../../providers/team-role.provider";
import { Link } from "react-router-dom";

interface CardTeamProps {
  handle?: string;
  role?: TeamMemberRole;
  name?: string;
  avatar?: string;
}

export const CardPerson = ({ name, handle, role, avatar }: CardTeamProps) => {
  return (
    <Anchor
      component={Link}
      to={`/humans/people/${handle}`}
      underline="never"
      c="var(--mantine-color-text)"
    >
      <Paper radius="md" withBorder p="lg" className="grow-on-hover">
        <Stack gap="xs">
          <Avatar src={avatar} size={120} radius={120} mx="auto" />
          <Box mt="sm">
            <Text ta="center" fz="lg" fw={500}>
              {name}
            </Text>
            {handle && (
              <Text ta="center" c="dimmed" fz="sm">
                @{handle}
              </Text>
            )}
          </Box>
          {role && (
            <Group justify="center">
              <Badge variant="light" color={teamRoleColorMap[role]}>
                {role}
              </Badge>
            </Group>
          )}
        </Stack>
      </Paper>
    </Anchor>
  );
};
