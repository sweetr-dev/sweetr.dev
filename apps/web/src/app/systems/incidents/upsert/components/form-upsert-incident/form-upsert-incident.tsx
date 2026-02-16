import { Stack, Title, TextInput, Divider, Group } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { UseFormReturnType } from "@mantine/form";
import { IncidentForm } from "../../../types";
import { IconCalendar, IconLink } from "@tabler/icons-react";
import { InputSelectApplication } from "../../../../../../components/input-select-application/input-select-application";
import { InputSelectPerson } from "../../../../../../components/input-select-person/input-select-person";
import { InputSelectTeam } from "../../../../../../components/input-select-team";
import { InputSelectDeployment } from "../../../../../../components/input-select-deployment/input-select-deployment";
import { addSeconds, parseISO } from "date-fns";
import { useState } from "react";

export interface FormUpsertIncidentProps {
  form: UseFormReturnType<IncidentForm>;
}

export const FormUpsertIncident = ({ form }: FormUpsertIncidentProps) => {
  const [causeDeploymentDate, setCauseDeploymentDate] = useState<
    string | undefined
  >();

  return (
    <>
      <Stack p="md">
        <Title order={5}>Detection</Title>

        <InputSelectApplication
          withAsterisk
          label="Application"
          {...form.getInputProps("applicationId")}
          onChange={(value) => {
            form.setFieldValue("applicationId", value);
            form.setFieldValue("causeDeploymentId", "");
            form.setFieldValue("fixDeploymentId", "");
          }}
          onOptionSelected={(item) => {
            if ("teamId" in item && typeof item.teamId === "string") {
              form.setFieldValue("teamId", item.teamId);
            }
          }}
        />

        {form.values.applicationId && (
          <>
            <Group align="flex-start">
              <InputSelectDeployment
                label="Caused by deployment"
                applicationIds={[form.values.applicationId]}
                {...form.getInputProps("causeDeploymentId")}
                onOptionSelected={(item) => {
                  if (
                    "deployedAt" in item &&
                    typeof item.deployedAt === "string"
                  ) {
                    form.setFieldValue("detectedAt", item.deployedAt);
                    setCauseDeploymentDate(item.deployedAt);
                    form.setFieldValue("fixDeploymentId", "");
                  }
                }}
                withAsterisk
                flex="1"
                searchPlaceholder="Search by version"
              />

              <DateTimePicker
                label="Detected At"
                placeholder="When was the incident first detected?"
                withAsterisk
                maxDate={new Date()}
                minDate={causeDeploymentDate}
                leftSection={<IconCalendar size={16} stroke={1.5} />}
                {...form.getInputProps("detectedAt")}
                flex="1"
              />
            </Group>
          </>
        )}
      </Stack>

      {form.values.applicationId && (
        <>
          <Divider my="sm" />

          <Stack p="md">
            <Title order={5}>Response</Title>

            <Group w="100%" align="flex-start">
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

            <Group align="flex-start">
              <InputSelectDeployment
                label="Resolved by deployment"
                applicationIds={[form.values.applicationId]}
                deployedAt={
                  form.values.detectedAt
                    ? {
                        from: addSeconds(
                          parseISO(form.values.detectedAt),
                          1,
                        ).toISOString(),
                        to: new Date().toISOString(),
                      }
                    : undefined
                }
                {...form.getInputProps("fixDeploymentId")}
                onOptionSelected={(item) => {
                  if (
                    "deployedAt" in item &&
                    typeof item.deployedAt === "string"
                  ) {
                    form.setFieldValue("resolvedAt", item.deployedAt);
                  }
                }}
                clearable
                flex="1"
                searchPlaceholder="Search by version"
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
