import { Anchor, Group, Paper, Stack, Title, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";

interface CardOpenableSettingsProps {
  left: React.ReactNode;
  right?: React.ReactNode;
  title: string;
  description: string;
  href?: string;
}

export const CardOpenableSettings = ({
  left,
  right,
  title,
  description,
  href,
}: CardOpenableSettingsProps) => {
  const rightSection = right || <IconArrowRight stroke={1.5} size={20} />;

  const content = (
    <Paper p="md" withBorder className={href ? "grow-on-hover" : ""}>
      <Group justify="space-between" wrap="nowrap">
        <Group>
          {left}
          <Stack gap={0}>
            <Title order={5}>{title}</Title>
            <Text c="dimmed" size="sm">
              {description}
            </Text>
          </Stack>
        </Group>
        <Group>{rightSection}</Group>
      </Group>
    </Paper>
  );

  return href ? (
    <Anchor
      component={Link}
      to={href}
      underline="never"
      c="var(--mantine-color-text)"
    >
      {content}
    </Anchor>
  ) : (
    content
  );
};
