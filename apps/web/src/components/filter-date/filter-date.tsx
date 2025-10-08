import {
  Box,
  Button,
  CloseButton,
  Grid,
  Group,
  NavLink,
  Popover,
  Stack,
} from "@mantine/core";
import { CalendarLevel, DatePicker } from "@mantine/dates";
import { useState } from "react";
import classNames from "./filter-date.module.css";
import {
  endOfDay,
  endOfToday,
  format,
  parse,
  startOfDay,
  subDays,
} from "date-fns";
import { IconProps } from "@tabler/icons-react";
import { UTCDate } from "@date-fns/utc";
import { parseYyMmDd } from "../../providers/date.provider";

interface FilterDateProps {
  label: string;
  icon: React.ComponentType<IconProps>;
  onChange?: (value: [Date | null, Date | null]) => void;
  value: [Date | null, Date | null];
  clearable?: boolean;
}

const dateShorcuts = [
  {
    label: "Last 24 hours",
    days: 1,
  },
  {
    label: "Last 7 days",
    days: 7,
  },
  {
    label: "Last 30 days",
    days: 30,
  },
  {
    label: "Last 90 days",
    days: 90,
  },
  {
    label: "Last year",
    days: 365,
  },
];

export const FilterDate = ({
  label,
  icon: Icon,
  onChange,
  value: selectedDate,
  clearable,
}: FilterDateProps) => {
  const [displayedDate, setDisplayedDate] = useState(new Date());
  const [displayedLevel, setDisplayedLevel] = useState<CalendarLevel>("year");

  const handleDateSelected = (
    value: [string | null, string | null],
    changeDisplayeDate?: boolean,
  ) => {
    const startDate = value[0]
      ? parse(value[0], "yyyy-MM-dd", startOfDay(new Date()))
      : null;
    const endDate = value[1] ? endOfDay(new UTCDate(value[1])) : null;

    setDisplayedLevel("month");

    if (startDate && changeDisplayeDate) setDisplayedDate(startDate);

    onChange?.([startDate, endDate]);
  };

  const isShortcutSelected = (days: number) => {
    return (
      JSON.stringify(selectedDate) === JSON.stringify(getShortcutValue(days))
    );
  };

  const getShortcutValue = (days: number): [string, string] => {
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfToday();

    return [format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd")];
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

    if (selectedShortcut) {
      return selectedShortcut.label.toLowerCase();
    }

    return `${format(startDate, "MMM d, yyyy")} to 
    ${format(endDate, "MMM d, yyyy")}`;
  };

  const selectedShortcut = dateShorcuts.find((shortcut) =>
    isShortcutSelected(shortcut.days),
  );

  return (
    <>
      <Popover position="bottom" shadow="md" trapFocus keepMounted>
        <Popover.Target>
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
            <Group gap={4}>
              <strong>{label}</strong> {getTimeLabel()}
            </Group>
          </Button>
        </Popover.Target>

        <Popover.Dropdown bg="var(--mantine-color-body)" p={0}>
          <Grid gutter={0}>
            <Grid.Col span="auto">
              <Stack gap={4} p="xs">
                {dateShorcuts.map((shortcut) => (
                  <NavLink
                    className={classNames.dateShortcut}
                    key={shortcut.days}
                    active={selectedShortcut?.days === shortcut.days}
                    onClick={() =>
                      handleDateSelected(getShortcutValue(shortcut.days), true)
                    }
                    label={shortcut.label}
                  />
                ))}
              </Stack>
            </Grid.Col>

            <Grid.Col span="auto">
              <Box p="xs" className={classNames.datePickerContainer} h="100%">
                <DatePicker
                  type="range"
                  allowSingleDateInRange
                  level={displayedLevel}
                  maxDate={new Date()}
                  value={selectedDate}
                  onDateChange={(date) => setDisplayedDate(new Date(date))}
                  onLevelChange={setDisplayedLevel}
                  date={displayedDate}
                  onChange={handleDateSelected}
                />
              </Box>
            </Grid.Col>
          </Grid>
        </Popover.Dropdown>
      </Popover>
    </>
  );
};
