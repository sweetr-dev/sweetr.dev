import { Anchor, Group, Paper, Stack, Title, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";

interface CardOpenableSettingsProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

export const CardOpenableSettings = ({
  icon,
  title,
  description,
  href,
}: CardOpenableSettingsProps) => {
  return (
    <Anchor
      component={Link}
      to={href}
      underline="never"
      c="var(--mantine-color-text)"
    >
      <Paper p="md" radius="md" withBorder className="grow-on-hover">
        <Group justify="space-between" wrap="nowrap">
          <Group>
            {icon}
            <Stack gap={0}>
              <Title order={5}>{title}</Title>
              <Text c="dimmed" size="sm">
                {description}
              </Text>
            </Stack>
          </Group>
          <IconArrowRight stroke={1.5} size={20} />
        </Group>
      </Paper>
    </Anchor>
  );
};
