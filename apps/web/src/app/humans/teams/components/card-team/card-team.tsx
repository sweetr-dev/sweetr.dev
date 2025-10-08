import { Anchor, Group, Paper, Stack, Text, Title } from "@mantine/core";
import type { FC } from "react";
import { TeamMembers } from "./team-members";
import classes from "./card-team.module.css";
import { Link } from "react-router-dom";

interface CardTeamProps {
  id: string;
  title: string;
  description?: string;
  startColor: string;
  endColor: string;
  iconEmoji: string;
  members: {
    name: string;
    handle: string;
    avatar?: string;
  }[];
}

export const CardTeam: FC<CardTeamProps> = ({
  id,
  title,
  description,
  startColor,
  endColor,
  iconEmoji,
  members,
}) => {
  return (
    <Anchor
      component={Link}
      to={`/teams/${id}`}
      underline="never"
      c="var(--mantine-color-text)"
    >
      <Paper
        withBorder
        radius="md"
        p="lg"
        pt="md"
        className={`${classes.card} grow-on-hover`}
        style={{
          ["--startColor"]: startColor,
          ["--endColor"]: endColor,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.1)",
            margin: "0 auto",
            boxShadow: "0 0 20px rgba(0,0,0,0.25)",
          }}
        >
          <Text fz={32} lh={2} fw={500} ta="center">
            {iconEmoji}
          </Text>
        </div>
        <Group wrap="nowrap" align="flex-start" justify="center" mt="lg">
          <Stack gap={2} align="center">
            <Title order={3} ta="center" lineClamp={2}>
              {title}
            </Title>
            <Text size="sm" c="dimmed" lineClamp={2}>
              {description}
            </Text>
          </Stack>
        </Group>
        <Stack align="center">
          <TeamMembers
            members={members}
            spacing="xs"
            mt="md"
            style={{ filter: "grayscale(1)" }}
          />
        </Stack>
      </Paper>
    </Anchor>
  );
};
