import { Divider, Stack, TextInput, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { DeploymentSettingsTrigger } from "@sweetr/graphql-types/frontend/graphql";
import { InputSelectRepository } from "../../../../../../components/input-select-repository";
import { InputSelectTeam } from "../../../../../../components/input-select-team";
import { ApplicationForm } from "../../../types";
import { InputDeploymentTrigger } from "./input-deployment-trigger";

export interface FormUpsertApplicationProps {
  form: UseFormReturnType<ApplicationForm>;
}

export const FormUpsertApplication = ({ form }: FormUpsertApplicationProps) => {
  return (
    <>
      <Stack p="md">
        <Title order={5}>Details</Title>
        <TextInput
          placeholder="example-app"
          label="Application name"
          withAsterisk
          {...form.getInputProps("name")}
        />

        <TextInput
          placeholder="An app serving as an example"
          label="Description"
          maxLength={150}
          {...form.getInputProps("description")}
        />
      </Stack>

      <Divider my="sm" />

      <Stack p="md">
        <Title order={5}>Ownership</Title>

        <InputSelectTeam
          label="Team"
          placeholder="Select an option"
          {...form.getInputProps("teamId")}
          clearable
        />
      </Stack>
      <Divider my="sm" />

      <Stack p="md">
        <Title order={5}>Deployment</Title>
        <InputSelectRepository
          label="Repository"
          required
          {...form.getInputProps("repositoryId")}
        />
        <TextInput
          label="Subdirectory"
          description="The subdirectory of the application. Useful for monorepos."
          maxLength={150}
          leftSection={"/"}
          placeholder="apps/example-app"
          {...form.getInputProps("deploymentSettings.subdirectory")}
        />

        <InputDeploymentTrigger form={form} />

        {form.values.deploymentSettings?.trigger ===
          DeploymentSettingsTrigger.MERGE && (
          <TextInput
            label="Target branch"
            maxLength={150}
            placeholder="main"
            {...form.getInputProps("deploymentSettings.targetBranch")}
          />
        )}
      </Stack>
    </>
  );
};
