import { Radio, Group, Stack, Text, Input } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { DeploymentSettingsTrigger } from "@sweetr/graphql-types/api";
import { IconWebhook, IconGitMerge } from "@tabler/icons-react";
import { ApplicationForm } from "../../../types";
import { ButtonDocs } from "../../../../../../components/button-docs";

interface InputDeploymentTriggerProps {
  form: UseFormReturnType<ApplicationForm>;
}
export const InputDeploymentTrigger = ({
  form,
}: InputDeploymentTriggerProps) => {
  return (
    <>
      <Group justify="space-between" align="center" wrap="nowrap">
        <Input.Label>Deployment Ingestion</Input.Label>
        <ButtonDocs href="https://docs.sweetr.dev/features/deployments" />
      </Group>
      <Radio.Group {...form.getInputProps("deploymentSettings.trigger")}>
        <Group wrap="nowrap">
          <Radio.Card
            p="md"
            radius="md"
            value={DeploymentSettingsTrigger.WEBHOOK}
            bd={
              form.values.deploymentSettings.trigger ===
              DeploymentSettingsTrigger.WEBHOOK
                ? "1px solid var(--mantine-color-green-4)"
                : undefined
            }
          >
            <Group wrap="nowrap" align="center">
              <Stack>
                <Group wrap="nowrap" justify="space-between" gap="xs">
                  <IconWebhook
                    size={40}
                    stroke={1.5}
                    color={
                      form.values.deploymentSettings.trigger ===
                      DeploymentSettingsTrigger.WEBHOOK
                        ? "var(--mantine-color-green-4)"
                        : undefined
                    }
                  />
                </Group>
                <Stack gap={5}>
                  <Text
                    fw={500}
                    c={
                      form.values.deploymentSettings.trigger ===
                      DeploymentSettingsTrigger.WEBHOOK
                        ? "var(--mantine-color-green-4)"
                        : undefined
                    }
                  >
                    API
                  </Text>
                  <Text fz="sm">
                    Send API requests to feed deployment events to Sweetr.
                  </Text>
                </Stack>
              </Stack>
            </Group>
          </Radio.Card>

          <Radio.Card
            p="md"
            radius="md"
            value={DeploymentSettingsTrigger.MERGE}
            bd={
              form.values.deploymentSettings.trigger ===
              DeploymentSettingsTrigger.MERGE
                ? "1px solid var(--mantine-color-green-4)"
                : undefined
            }
          >
            <Group wrap="nowrap" align="center">
              <Stack>
                <IconGitMerge
                  size={40}
                  stroke={1.5}
                  color={
                    form.values.deploymentSettings.trigger ===
                    DeploymentSettingsTrigger.MERGE
                      ? "var(--mantine-color-green-4)"
                      : undefined
                  }
                />
                <Stack gap={5}>
                  <Group>
                    <Text
                      fw={500}
                      c={
                        form.values.deploymentSettings.trigger ===
                        DeploymentSettingsTrigger.MERGE
                          ? "var(--mantine-color-green-4)"
                          : undefined
                      }
                    >
                      Merge
                    </Text>
                  </Group>
                  <Text fz="sm">
                    Automatically create a deployment when a pull request is
                    merged.
                  </Text>
                </Stack>
              </Stack>
            </Group>
          </Radio.Card>
        </Group>
      </Radio.Group>
    </>
  );
};
