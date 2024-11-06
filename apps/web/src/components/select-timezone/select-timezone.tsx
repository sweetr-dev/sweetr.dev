import { Group, Select, SelectProps, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { timezones } from "./timezones";

export const SelectTimezone = (props: SelectProps) => {
  const renderSelectOption: SelectProps["renderOption"] = ({
    option,
    checked,
  }) => (
    <Group justify="space-between" grow w="100%">
      <Group flex="1" gap="xs" grow justify="flex-start">
        {checked && (
          <IconCheck
            stroke={4}
            size={14}
            style={{ flexGrow: 0, flexShrink: 1 }}
            color="var(--mantine-color-dark-3)"
          />
        )}
        {option.label}
      </Group>
      <Text fz="xs" style={{ flexGrow: 0, flexShrink: 1 }}>
        {new Date().toLocaleTimeString("en-US", {
          timeZone: option.value,
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </Group>
  );

  return (
    <Select
      label="Timezone"
      {...props}
      searchable
      renderOption={renderSelectOption}
      data={timezones}
      defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone}
    />
  );
};
