import {
  Box,
  Group,
  HoverCard,
  Stack,
  Stepper,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { BreakdownStage } from "@sweetr/graphql-types/frontend/graphql";
import {
  IconArrowDownRight,
  IconArrowNarrowRightDashed,
  IconArrowUpRight,
} from "@tabler/icons-react";
import {
  DateTimeRange,
  formatLocaleDate,
  formatMsDuration,
  getAbbreviatedDuration,
} from "../../../../../providers/date.provider";
import { UTCDate } from "@date-fns/utc";

interface StepProps {
  stage: BreakdownStage;
  label: string;
  icon: React.ElementType;
  previousPeriod?: Partial<DateTimeRange>;
}

export const Step = ({
  stage,
  label,
  icon: Icon,
  previousPeriod,
}: StepProps) => {
  const duration = stage.currentAmount
    ? getAbbreviatedDuration(stage.currentAmount)
    : "0s";
  const exactDuration = stage.currentAmount
    ? formatMsDuration(stage.currentAmount)
    : "0s";
  const change = stage.change;

  return (
    <Stepper.Step
      styles={{
        step: {
          alignItems: "start",
          gap: 10,
        },
        stepIcon: {
          border: 0,
          display: "block",
          background: "transparent",
        },
        stepBody: {
          marginLeft: 0,
        },
      }}
      label={
        <Text size="sm" c="dimmed">
          {label}
        </Text>
      }
      description={
        <Stack gap={5}>
          <Tooltip label={exactDuration} withArrow position="left">
            <Text size="lg" fw={500} c="bright" lineClamp={1}>
              {duration}
            </Text>
          </Tooltip>
          <HoverCard position="left" withArrow>
            <HoverCard.Target>
              <Box>
                {change !== 0 && (
                  <Group gap={2}>
                    <Text c={change > 0 ? "red" : "green.4"}>
                      {change > 0 ? (
                        <IconArrowUpRight size={12} stroke={1.5} />
                      ) : (
                        <IconArrowDownRight size={12} stroke={1.5} />
                      )}
                    </Text>
                    <Text size="xs">{Math.abs(change)}%</Text>
                  </Group>
                )}
                {change === 0 && (
                  <Group gap={2}>
                    <IconArrowNarrowRightDashed size={12} stroke={1.5} />
                    <Text size="xs" c={"dimmed"}>
                      {Math.abs(change)}%
                    </Text>
                  </Group>
                )}
              </Box>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              {previousPeriod?.from && previousPeriod?.to && (
                <Text c="dimmed" size="sm">
                  {formatLocaleDate(new UTCDate(previousPeriod.from), {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  -{" "}
                  {formatLocaleDate(new UTCDate(previousPeriod.to), {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              )}
              <Text size="lg" fw={500} c="bright" display="inline-block">
                {stage.previousAmount
                  ? getAbbreviatedDuration(stage.previousAmount)
                  : "0s"}
              </Text>
            </HoverCard.Dropdown>
          </HoverCard>
        </Stack>
      }
      icon={
        <ThemeIcon variant="outline" color="green" size="lg" radius="xl">
          <Icon size={18} stroke={1.5} />
        </ThemeIcon>
      }
    />
  );
};
