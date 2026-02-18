import { Group, HoverCard, Paper, Stack, Text } from "@mantine/core";
import {
  IconArrowDownRight,
  IconArrowNarrowRightDashed,
  IconArrowUpRight,
  IconProps,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import {
  DateTimeRange,
  formatLocaleDate,
} from "../../../../providers/date.provider";

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

      <HoverCard withArrow>
        <HoverCard.Target>
          <Stack gap="xs">
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
            <Text fz="xs" c="dimmed" lineClamp={2}>
              Compared to previous period.
            </Text>
          </Stack>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text c="dimmed" size="sm">
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
          <Text size="lg" fw={500} c="bright" display="inline-block">
            {previousAmount}
          </Text>
        </HoverCard.Dropdown>
      </HoverCard>
    </Paper>
  );
};
