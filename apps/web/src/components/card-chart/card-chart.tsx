import { ReactNode } from "react";
import {
  Paper,
  Group,
  Text,
  Divider,
  Stack,
  HoverCard,
  ActionIcon,
  PaperProps,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

interface ChartCardProps extends PaperProps {
  title: string;
  description: ReactNode;
  children: ReactNode;
  height?: number;
  style?: React.CSSProperties;
}

export const CardChart = ({
  title,
  description,
  children,
  height = 340,
  ...props
}: ChartCardProps) => {
  const descriptionNode =
    typeof description === "string" ? (
      <Text size="sm">{description}</Text>
    ) : (
      description
    );

  return (
    <Paper withBorder h={height} p={0} w="100%" {...props}>
      <Stack h="100%" gap={0}>
        <Group
          p="sm"
          py="xs"
          justify="space-between"
          wrap="nowrap"
          align="center"
        >
          <Text size="sm" c="dimmed" tt="uppercase" fw={500} lh={1}>
            {title}
          </Text>

          <HoverCard position="bottom-end" width={360} shadow="md" withArrow>
            <HoverCard.Target>
              <ActionIcon
                size="lg"
                variant="subtle"
                color="var(--mantine-color-text)"
              >
                <IconInfoCircle stroke={2} size={16} />
              </ActionIcon>
            </HoverCard.Target>
            <HoverCard.Dropdown>{descriptionNode}</HoverCard.Dropdown>
          </HoverCard>
        </Group>

        <Divider />

        <Stack p="lg" flex={1}>
          {children}
        </Stack>
      </Stack>
    </Paper>
  );
};
