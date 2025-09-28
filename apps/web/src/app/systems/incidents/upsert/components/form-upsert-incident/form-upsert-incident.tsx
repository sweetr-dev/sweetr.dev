import { Stack, Title, TextInput, Divider, Group } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { UseFormReturnType } from "@mantine/form";
import { IncidentForm } from "../../../types";
import { IconCalendar, IconLink } from "@tabler/icons-react";
import { InputSelectApplication } from "../../../../../../components/input-select-application/input-select-application";
import { InputSelectPerson } from "../../../../../../components/input-select-person/input-select-person";
import { InputSelectTeam } from "../../../../../../components/input-select-team";
import { InputSelectDeployment } from "../../../../../../components/input-select-deployment/input-select-deployment";
import { useState } from "react";

export interface FormUpsertIncidentProps {
  form: UseFormReturnType<IncidentForm>;
  applicationId?: string;
}

export const FormUpsertIncident = ({
  form,
  applicationId: initialApplicationId,
}: FormUpsertIncidentProps) => {
  const [applicationId, setApplicationId] = useState(initialApplicationId);

  return (
    <>
      <Stack p="md">
        <Title order={5}>Details</Title>

        <InputSelectApplication
          withAsterisk
          label="Application"
          value={applicationId}
          onChange={setApplicationId}
        />

        {applicationId && (
          <>
            <Group>
              <InputSelectDeployment
                label="Caused by deployment"
                applicationIds={[applicationId]}
                {...form.getInputProps("causeDeploymentId")}
                withAsterisk
                flex="1"
              />

              <DateTimePicker
                label="Detected At"
                placeholder="When was the incident first detected?"
                withAsterisk
                maxDate={new Date()}
                leftSection={<IconCalendar size={16} stroke={1.5} />}
                {...form.getInputProps("detectedAt")}
                flex="1"
              />
            </Group>
          </>
        )}
      </Stack>

      {applicationId && (
        <>
          <Divider my="sm" />

          <Stack p="md">
            <Title order={5}>Response</Title>

            <Group w="100%">
              <InputSelectTeam
                label="Team"
                {...form.getInputProps("teamId")}
                clearable
                flex="1"
              />

              <InputSelectPerson
                label="Incident Leader"
                {...form.getInputProps("leaderId")}
                clearable
                flex="1"
              />
            </Group>

            <Group>
              <InputSelectDeployment
                label="Resolved by deployment"
                applicationIds={[applicationId]}
                {...form.getInputProps("fixDeploymentId")}
                clearable
                flex="1"
              />

              <DateTimePicker
                label="Resolved At"
                maxDate={new Date()}
                minDate={form.values.detectedAt}
                leftSection={<IconCalendar size={16} stroke={1.5} />}
                clearable
                {...form.getInputProps("resolvedAt")}
                flex="1"
              />
            </Group>

            <TextInput
              label="Postmortem URL"
              leftSection={<IconLink size={16} stroke={1.5} />}
              {...form.getInputProps("postmortemUrl")}
            />
          </Stack>
        </>
      )}
    </>
  );
};
