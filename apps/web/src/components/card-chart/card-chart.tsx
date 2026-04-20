import { ReactNode } from "react";
import { Paper, Group, Text, Divider, Stack, HoverCard } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

interface ChartCardProps {
  title: string;
  description: string;
  children: ReactNode;
  height?: number;
  style?: React.CSSProperties;
  href?: string;
}

export const CardChart = ({
  title,
  description,
  children,
  height = 340,
  style,
  href,
}: ChartCardProps) => {
  return (
    <Paper
      withBorder
      h={height}
      p={0}
      display="flex"
      style={{ flexDirection: "column", ...style }}
    >
      <Group p="sm" py={8} justify="space-between" wrap="nowrap">
        <Text fw={500} c="dark.0" tt="uppercase" lineClamp={1}>
          {title}
        </Text>

        <HoverCard position="bottom-end" width={280} shadow="md" withArrow>
          <HoverCard.Target>
            <IconInfoCircle size={16} stroke={2} />
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text size="sm">{description}</Text>
          </HoverCard.Dropdown>
        </HoverCard>
      </Group>

      <Divider />

      <Stack p="xl" flex={1}>
        {children}
      </Stack>
    </Paper>
  );
};
