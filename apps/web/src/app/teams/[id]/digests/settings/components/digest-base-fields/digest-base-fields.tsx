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
import { DayOfTheWeek } from "@sweetr/graphql-types/frontend/graphql";
import { useEffect, useRef } from "react";

interface DigestBaseFieldsProps {
  form: UseFormReturnType<FormDigest>;
}

export const DigestBaseFields = ({ form }: DigestBaseFieldsProps) => {
  const isEnabled = form.values.enabled;

  const channelRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEnabled && !form.values.channel) {
      channelRef.current?.focus();
    }
  }, [isEnabled, form.values.channel]);

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

        {isEnabled && (
          <TextInput
            ref={channelRef}
            label="Channel"
            leftSection={<IconBrandSlack stroke={1} />}
            placeholder="#team"
            {...form.getInputProps("channel")}
          />
        )}
      </Stack>

      {isEnabled && (
        <>
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
              value={form.values.frequency}
              onChange={(value) => {
                form.setFieldValue("frequency", value as Frequency);

                if (
                  value === Frequency.MONTHLY &&
                  form.values.dayOfTheWeek.length > 1
                ) {
                  form.setFieldValue(
                    "dayOfTheWeek",
                    form.values.dayOfTheWeek.slice(-1),
                  );
                }
              }}
            />
            <Box>
              <InputLabel>Day of the week</InputLabel>
              <Chip.Group
                value={form.values.dayOfTheWeek}
                onChange={(value) => {
                  if (form.values.frequency === Frequency.WEEKLY) {
                    form.setFieldValue("dayOfTheWeek", value as DayOfTheWeek[]);
                  } else if (value) {
                    form.setFieldValue("dayOfTheWeek", [
                      (value as string[]).pop() as DayOfTheWeek,
                    ]);
                  }
                }}
                multiple={form.values.frequency === Frequency.WEEKLY}
              >
                <Group>
                  <Chip value={`${DayOfTheWeek.MONDAY}`} size="xs">
                    Monday
                  </Chip>
                  <Chip value={`${DayOfTheWeek.TUESDAY}`} size="xs">
                    Tuesday
                  </Chip>
                  <Chip value={`${DayOfTheWeek.WEDNESDAY}`} size="xs">
                    Wednesday
                  </Chip>
                  <Chip value={`${DayOfTheWeek.THURSDAY}`} size="xs">
                    Thursday
                  </Chip>
                  <Chip value={`${DayOfTheWeek.FRIDAY}`} size="xs">
                    Friday
                  </Chip>
                  <Chip value={`${DayOfTheWeek.SATURDAY}`} size="xs">
                    Saturday
                  </Chip>
                  <Chip value={`${DayOfTheWeek.SUNDAY}`} size="xs">
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
      )}
    </>
  );
};
