import { Group, HoverCard, Paper, Text } from "@mantine/core";
import {
  IconArrowDownRight,
  IconArrowNarrowRightDashed,
  IconArrowUpRight,
  IconInfoCircle,
  IconProps,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router";
import {
  DateTimeRange,
  formatLocaleDate,
} from "../../../../../providers/date.provider";

interface CardDoraMetricProps {
  name: string;
  amount: string;
  amountDescription?: string;
  previousAmount: string;
  change: number;
  icon: React.ComponentType<IconProps>;
  href: string;
  higherIsBetter: boolean;
  previousPeriod?: Partial<DateTimeRange>;
}

export const CardDoraMetric = ({
  name,
  amount,
  change,
  amountDescription,
  previousAmount,
  icon: Icon,
  href,
  higherIsBetter,
  previousPeriod,
}: CardDoraMetricProps) => {
  const { pathname } = useLocation();
  const isActive = pathname === href;

  const getTrendColor = () => {
    if (change === 0) {
      return "dimmed";
    }

    const isPositiveChange = change >= 0;
    const isGood = higherIsBetter ? isPositiveChange : !isPositiveChange;

    return isGood ? "green.4" : "red";
  };

  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      h="100%"
      ta="left"
      w="100%"
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

      <Text
        c={getTrendColor()}
        fz="sm"
        fw={500}
        style={{ display: "flex", alignItems: "center", gap: 4 }}
      >
        {change === 0 && (
          <>
            <span>0%</span>
            <IconArrowNarrowRightDashed size="1rem" stroke={1.5} />
          </>
        )}
        {change !== 0 && (
          <>
            <span>
              {change >= 0 ? "+" : ""}
              {change}%
            </span>
            {(change >= 0 && higherIsBetter) ||
            (change < 0 && !higherIsBetter) ? (
              <IconArrowUpRight size="1rem" stroke={1.5} />
            ) : (
              <IconArrowDownRight size="1rem" stroke={1.5} />
            )}
          </>
        )}
      </Text>
      <HoverCard withArrow offset={10}>
        <HoverCard.Target>
          <Group gap={4} align="center" style={{ cursor: "default" }}>
            <Text fz="xs" c="dimmed">
              Compared to previous period
            </Text>
            <IconInfoCircle
              size={14}
              stroke={2}
              color="var(--mantine-color-dimmed)"
            />
          </Group>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text c="dimmed" size="sm" fw={500}>
            Previous period
          </Text>
          <Text c="bright" size="md" fw={500}>
            {previousPeriod?.from && previousPeriod?.to ? (
              <>
                {formatLocaleDate(new Date(previousPeriod.from), {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {formatLocaleDate(new Date(previousPeriod.to), {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </>
            ) : (
              "Previous period unavailable"
            )}
          </Text>
          <Text mt="sm" fw={500} size="sm" c="dimmed">
            Previous value
          </Text>
          <Text size="md" fw={500} c="bright" display="inline-block">
            {previousAmount}
          </Text>
        </HoverCard.Dropdown>
      </HoverCard>
    </Paper>
  );
};
