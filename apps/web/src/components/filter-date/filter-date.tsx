import {
  Box,
  Button,
  CloseButton,
  Grid,
  NavLink,
  Popover,
  Stack,
} from "@mantine/core";
import { CalendarLevel, DatePicker } from "@mantine/dates";
import { useState } from "react";
import classNames from "./filter-date.module.css";
import { endOfDay, endOfToday, format, startOfDay, subDays } from "date-fns";

interface FilterDateProps {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
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
    value: [Date | null, Date | null],
    changeDisplayeDate?: boolean,
  ) => {
    const startDate = value[0] ? startOfDay(value[0]) : null;
    const endDate = value[1] ? endOfDay(value[1]) : null;

    setDisplayedLevel("month");

    if (startDate && changeDisplayeDate) setDisplayedDate(startDate);

    onChange?.([startDate, endDate]);
  };

  const isShortcutSelected = (days: number) => {
    return (
      JSON.stringify(selectedDate) === JSON.stringify(getShortcutValue(days))
    );
  };

  const getShortcutValue = (days: number): [Date, Date] => {
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfToday();

    return [startDate, endDate];
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
            <strong style={{ marginRight: 4 }}>{label}</strong> {getTimeLabel()}
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
                  onDateChange={setDisplayedDate}
                  onLevelChange={setDisplayedLevel}
                  date={displayedDate}
                  onChange={handleDateSelected}
                  color="red"
                />
              </Box>
            </Grid.Col>
          </Grid>
        </Popover.Dropdown>
      </Popover>
    </>
  );
};
