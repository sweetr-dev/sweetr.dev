import {
  Stack,
  Title,
  Switch,
  TextInput,
  Divider,
  Select,
  Box,
  InputLabel,
  Chip,
  Group,
} from "@mantine/core";
import { IconBrandSlack, IconClock, IconWorld } from "@tabler/icons-react";
import { BoxSetting } from "../../../../../../components/box-setting";
import { SelectHour } from "../../../../../../components/select-hour";
import { SelectTimezone } from "../../../../../../components/select-timezone/select-timezone";
import { WeekDay } from "../../../../../../providers/date.provider";

export const FormDigestMetrics = () => {
  return (
    <>
      <Stack p="md">
        <Title order={5}>Settings</Title>

        <BoxSetting label="Enabled">
          <Switch size="lg" color="green.7" onLabel="ON" offLabel="OFF" />
        </BoxSetting>

        <TextInput
          label="Channel"
          leftSection={<IconBrandSlack stroke={1.5} />}
          placeholder="#team"
        />
      </Stack>

      <Divider my="md" />

      <Stack p="md" pb="xl">
        <Title order={5}>Schedule</Title>

        <Select
          label="Frequency"
          data={[
            { value: "weekly", label: "Every week" },
            {
              value: "monthly",
              label: `First of the month`,
            },
          ]}
        />
        <Box>
          <InputLabel>Day of the week</InputLabel>
          <Chip.Group>
            <Group>
              <Chip value={`${WeekDay.MONDAY}`} size="xs">
                Monday
              </Chip>
              <Chip value={`${WeekDay.TUESDAY}`} size="xs">
                Tuesday
              </Chip>
              <Chip value={`${WeekDay.WEDNESDAY}`} size="xs">
                Wednesday
              </Chip>
              <Chip value={`${WeekDay.THURSDAY}`} size="xs">
                Thursday
              </Chip>
              <Chip value={`${WeekDay.FRIDAY}`} size="xs">
                Friday
              </Chip>
              <Chip value={`${WeekDay.SATURDAY}`} size="xs">
                Saturday
              </Chip>
              <Chip value={`${WeekDay.SUNDAY}`} size="xs">
                Sunday
              </Chip>
            </Group>
          </Chip.Group>
        </Box>
        <Group grow>
          <SelectHour
            label="Time"
            leftSection={<IconClock size={16} stroke={1.5} />}
          />
          <SelectTimezone
            label="Timezone"
            leftSection={<IconWorld size={16} stroke={1.5} />}
          />
        </Group>
      </Stack>
    </>
  );
};
