import {
  Anchor,
  Group,
  Paper,
  Stack,
  Text,
  PaperProps,
  Skeleton,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";

interface CardOpenableSettingsProps extends Omit<PaperProps, "left" | "right"> {
  left: React.ReactNode;
  right?: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  isLoading?: boolean;
}

export const CardSetting = ({
  left,
  right,
  title,
  description,
  href,
  isLoading,
  ...props
}: CardOpenableSettingsProps) => {
  const link = isLoading ? null : href;
  const rightSection = right || <IconChevronRight stroke={1.5} size={20} />;

  const content = (
    <Paper p="md" withBorder className={link ? "grow-on-hover" : ""} {...props}>
      <Group justify="space-between" wrap="nowrap">
        <Group wrap="nowrap">
          {left}
          <Stack gap={0}>
            {isLoading ? (
              <Skeleton height={20} width={100} />
            ) : (
              <Text fw={500}>{title}</Text>
            )}
            {isLoading ? (
              <Skeleton height={20} mt={5} width={200} />
            ) : (
              <Text c="dimmed" size="sm">
                {description}
              </Text>
            )}
          </Stack>
        </Group>
        {!isLoading && <Group>{rightSection}</Group>}
      </Group>
    </Paper>
  );

  return link ? (
    <Anchor
      component={Link}
      to={link}
      underline="never"
      c="var(--mantine-color-text)"
    >
      {content}
    </Anchor>
  ) : (
    content
  );
};
