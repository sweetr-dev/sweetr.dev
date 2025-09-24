import { Box, Button, CloseButton, Group, Popover } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { useState } from "react";
import {
  addWeeks,
  endOfWeek,
  format,
  getWeek,
  isFuture,
  startOfWeek,
  subWeeks,
} from "date-fns";
import {
  IconChevronLeft,
  IconChevronRight,
  IconProps,
} from "@tabler/icons-react";
import { UTCDate } from "@date-fns/utc";

interface FilterWeekProps {
  label: string;
  icon: React.ComponentType<IconProps>;
  onChange?: (value: [Date | null, Date | null]) => void;
  value: [Date | null, Date | null];
  clearable?: boolean;
}

export const FilterWeek = ({
  label,
  icon: Icon,
  onChange,
  value: selectedDate,
  clearable,
}: FilterWeekProps) => {
  const [hovered, setHovered] = useState<Date | null>(null);

  const handleDateSelected = (value: string) => {
    const date = new Date(value);
    const startDate = startOfWeek(date, { weekStartsOn: 1 });
    const endDate = endOfWeek(date, { weekStartsOn: 1 });

    onChange?.([startDate, endDate]);
  };

  const isSameWeek = (date: Date, value: Date | null) => {
    if (!value) return false;

    return (
      getWeek(date, { weekStartsOn: 1 }) === getWeek(value, { weekStartsOn: 1 })
    );
  };

  const getTimeLabel = () => {
    const startDate = selectedDate[0];
    const endDate = selectedDate[1];

    if (startDate && !endDate) {
      return `${format(startDate, "MMM d, yyyy")} to today`;
    }

    if (!startDate || !endDate) {
      return "anytime";
    }

    if (startDate.toDateString() === endDate.toDateString()) {
      return format(startDate, "MMM d, yyyy");
    }

    return `${format(startDate, "MMM d, yyyy")} to 
    ${format(endDate, "MMM d, yyyy")}`;
  };

  const moveWeek = (
    event: React.MouseEvent<HTMLButtonElement>,
    direction: "back" | "forward",
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!selectedDate[0]) return;
    const date =
      direction === "back"
        ? subWeeks(selectedDate[0], 1)
        : addWeeks(selectedDate[0], 1);

    onChange?.([
      startOfWeek(date, { weekStartsOn: 1 }),
      endOfWeek(date, { weekStartsOn: 1 }),
    ]);
  };

  return (
    <>
      <Popover position="bottom" shadow="md" trapFocus keepMounted>
        <Popover.Target>
          <Button.Group>
            <Button
              variant="default"
              onClick={(event) => moveWeek(event, "back")}
              px="xs"
              style={{ borderRight: "none" }}
            >
              <IconChevronLeft stroke={1.5} size={16} />
            </Button>

            <Button
              color="var(--mantine-color-body)"
              leftSection={<Icon size={16} />}
              style={{
                fontWeight: 400,
                border:
                  "calc(.0625rem*var(--mantine-scale)) solid var(--mantine-color-dark-4)",
              }}
              rightSection={
                selectedDate[1] !== null &&
                clearable && (
                  <CloseButton
                    size="xs"
                    aria-label="Clear filter"
                    onClick={(event) => {
                      event.stopPropagation();
                      onChange?.([null, null]);
                    }}
                  />
                )
              }
            >
              <Group gap={5}>
                <strong>{label}</strong> {getTimeLabel()}
              </Group>
            </Button>

            <Button
              variant="default"
              px="xs"
              style={{ borderLeft: "none" }}
              onClick={(event) => moveWeek(event, "forward")}
              disabled={!!selectedDate[1] && isFuture(selectedDate[1])}
            >
              <IconChevronRight stroke={1.5} size={16} />
            </Button>
          </Button.Group>
        </Popover.Target>

        <Popover.Dropdown bg="var(--mantine-color-body)" p={0}>
          <Box p="xs" h="100%">
            <Calendar
              defaultLevel="year"
              maxDate={new Date()}
              withCellSpacing={false}
              getDayProps={(dateString) => {
                const date = new UTCDate(dateString);

                const isHovered = isSameWeek(date, hovered);
                const isSelected = isSameWeek(date, selectedDate[0]);
                const isInRange = isHovered || isSelected;
                return {
                  onMouseEnter: () => setHovered(date),
                  onMouseLeave: () => setHovered(null),
                  inRange: isInRange,
                  firstInRange: isInRange && date.getDay() === 1,
                  lastInRange: isInRange && date.getDay() === 0,
                  selected: isSelected,
                  onClick: () => handleDateSelected(date.toISOString()),
                  bg: isHovered
                    ? "var(--mantine-color-green-light)"
                    : undefined,
                };
              }}
            />
          </Box>
        </Popover.Dropdown>
      </Popover>
    </>
  );
};
