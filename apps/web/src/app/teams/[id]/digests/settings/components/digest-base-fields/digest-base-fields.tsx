import { UseFormReturnType } from "@mantine/form";
import { FormDigest } from "../../types";
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
import { Frequency } from "@sweetr/graphql-types/api";
import { IconBrandSlack, IconClock, IconWorld } from "@tabler/icons-react";
import { BoxSetting } from "../../../../../../../components/box-setting";
import { SelectHour } from "../../../../../../../components/select-hour";
import { SelectTimezone } from "../../../../../../../components/select-timezone/select-timezone";
import { WeekDay } from "../../../../../../../providers/date.provider";

interface DigestBaseFieldsProps {
  form: UseFormReturnType<FormDigest>;
}

export const DigestBaseFields = ({ form }: DigestBaseFieldsProps) => {
  return (
    <>
      <Stack p="md">
        <Title order={5}>Settings</Title>

        <BoxSetting label="Enabled">
          <Switch
            size="lg"
            color="green.7"
            onLabel="ON"
            offLabel="OFF"
            {...form.getInputProps("enabled", { type: "checkbox" })}
          />
        </BoxSetting>

        <TextInput
          label="Channel"
          leftSection={<IconBrandSlack stroke={1} />}
          placeholder="#team"
          {...form.getInputProps("channel")}
        />
      </Stack>

      <Divider my="md" />

      <Stack p="md" pb="xl">
        <Title order={5}>Schedule</Title>

        <Select
          label="Frequency"
          data={[
            { value: Frequency.WEEKLY, label: "Every week" },
            {
              value: Frequency.MONTHLY,
              label: `First of the month`,
            },
          ]}
          {...form.getInputProps("frequency")}
        />
        <Box>
          <InputLabel>Day of the week</InputLabel>
          <Chip.Group
            value={`${form.values.dayOfTheWeek}`}
            onChange={(value) => {
              form.setFieldValue("dayOfTheWeek", parseInt(value as string));
            }}
          >
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
            {...form.getInputProps("timeOfDay")}
            label="Time"
            leftSection={<IconClock size={16} stroke={1.5} />}
          />
          <SelectTimezone
            {...form.getInputProps("timezone", { type: "input" })}
            label="Timezone"
            leftSection={<IconWorld size={16} stroke={1.5} />}
          />
        </Group>
      </Stack>
    </>
  );
};
