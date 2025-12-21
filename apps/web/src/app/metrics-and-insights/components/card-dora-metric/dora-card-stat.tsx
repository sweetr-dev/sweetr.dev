import { Text, Paper, Group, Stack } from "@mantine/core";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconProps,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";

interface CardDoraMetricProps {
  name: string;
  amount: string;
  amountDescription?: string;
  change: number;
  icon: React.ComponentType<IconProps>;
  href: string;
}

export const CardDoraMetric = ({
  name,
  amount,
  change,
  amountDescription,
  icon: Icon,
  href,
}: CardDoraMetricProps) => {
  const { pathname } = useLocation();
  const isActive = pathname === href;

  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      h="100%"
      ta="left"
      style={{
        borderColor: isActive ? "var(--mantine-color-dark-2)" : undefined,
      }}
      className="grow-on-hover"
      component={Link}
      to={href}
    >
      <Group justify="space-between" mb="md">
        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
          {name}
        </Text>
        <Icon size={24} stroke={1.5} color="var(--mantine-color-text)" />
      </Group>

      <Group gap="xs" mb="md" justify="space-between">
        <Text fz="lg" c="white" fw={500}>
          {amount}
        </Text>
        {amountDescription && (
          <Text fz="sm" c="dimmed">
            {amountDescription}
          </Text>
        )}
      </Group>

      <Stack gap="xs">
        <Group gap={5} align="center">
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
