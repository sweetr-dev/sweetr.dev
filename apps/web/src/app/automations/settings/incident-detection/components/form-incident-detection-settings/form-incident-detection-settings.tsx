import {
  Divider,
  SimpleGrid,
  Stack,
  Switch,
  TextInput,
  Title,
} from "@mantine/core";
import { BoxSetting } from "../../../../../../components/box-setting";
import { UseFormReturnType } from "@mantine/form";
import { FormIncidentDetection } from "../../types";

interface FormIncidentDetectionSettingsProps {
  form: UseFormReturnType<FormIncidentDetection>;
}

export const FormIncidentDetectionSettings = ({
  form,
}: FormIncidentDetectionSettingsProps) => {
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
      </Stack>

      {form.values.enabled && (
        <>
          <Divider my="sm" />

          <Stack p="md">
            <Title order={5}>Reverts</Title>

            <BoxSetting
              label="Create incident on deployed reverts"
              description="Automatically creates an incident when a revert PR is deployed."
            >
              <Switch
                size="lg"
                color="green.7"
                onLabel="ON"
                offLabel="OFF"
                {...form.getInputProps("settings.revert.enabled", {
                  type: "checkbox",
                })}
              />
            </BoxSetting>
          </Stack>

          <Divider my="sm" />

          <Stack p="md">
            <Title order={5}>Rollback</Title>

            <BoxSetting
              label="Create incident on rollbacks"
              description="Automatically creates an incident when a rollback is detected."
            >
              <Switch
                size="lg"
                color="green.7"
                onLabel="ON"
                offLabel="OFF"
                {...form.getInputProps("settings.rollback.enabled", {
                  type: "checkbox",
                })}
              />
            </BoxSetting>
          </Stack>

          <Divider my="sm" />

          <Stack p="md">
            <Title order={5}>Hotfixes</Title>
            <BoxSetting
              label="Create incident on deployed hotfixes"
              description="Automatically creates an incident when a hotfix PR is deployed."
            >
              <Switch
                size="lg"
                color="green.7"
                onLabel="ON"
                offLabel="OFF"
                {...form.getInputProps("settings.hotfix.enabled", {
                  type: "checkbox",
                })}
              />
            </BoxSetting>
            {form.values.settings.hotfix?.enabled && (
              <SimpleGrid cols={2}>
                <TextInput
                  label="Pull Request Title"
                  description="Regular expression to match against the PR title."
                  placeholder="hotfix"
                  maxLength={200}
                  {...form.getInputProps("settings.hotfix.prTitleRegEx")}
                />
                <TextInput
                  label="Branch Pattern"
                  description="Regular expression to match against the branch name."
                  placeholder="^hotfix"
                  maxLength={200}
                  {...form.getInputProps("settings.hotfix.branchRegEx")}
                />
                <TextInput
                  label="Pull Request Label"
                  description="Regular expression to match against PR labels."
                  placeholder="hotfix"
                  maxLength={200}
                  {...form.getInputProps("settings.hotfix.prLabelRegEx")}
                />
              </SimpleGrid>
            )}
          </Stack>
        </>
      )}
    </>
  );
};
