import { Text, Paper, Group, Stack } from "@mantine/core";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconProps,
} from "@tabler/icons-react";

interface DoraCardStatProps {
  name: string;
  amount: string;
  change: number;
  icon: React.ComponentType<IconProps>;
}

export const DoraCardStat = ({
  name,
  amount,
  change,
  icon: Icon,
}: DoraCardStatProps) => {
  return (
    <Paper withBorder p="md" radius="md" h="100%">
      <Group justify="space-between" mb="md">
        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
          {name}
        </Text>
        <Icon size={24} stroke={1.5} />
      </Group>

      <Text fz="lg" c="white" fw={500} mb="md">
        {amount}
      </Text>

      <Stack gap="xs">
        <Group gap={4} align="center">
          <Text
            c={change >= 0 ? "teal" : "red"}
            fz="sm"
            fw={500}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <span>
              {change >= 0 ? "+" : ""}
              {change}%
            </span>
            {change >= 0 ? (
              <IconArrowUpRight size="1rem" stroke={1.5} />
            ) : (
              <IconArrowDownRight size="1rem" stroke={1.5} />
            )}
          </Text>
        </Group>
        <Text fz="xs" c="dimmed" lineClamp={2}>
          Compared to previous UTC period.
        </Text>
      </Stack>
    </Paper>
  );
};
