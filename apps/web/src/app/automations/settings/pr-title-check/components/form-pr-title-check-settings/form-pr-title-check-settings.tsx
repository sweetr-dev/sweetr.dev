import { Anchor, Group, Stack, Switch, TextInput, Title } from "@mantine/core";
import { BoxSetting } from "../../../../../../components/box-setting";
import { UseFormReturnType } from "@mantine/form";
import { FormPrTitleCheck } from "../../types";
import { IconExternalLink } from "@tabler/icons-react";

interface FormPrTitleCheckSettingsProps {
  form: UseFormReturnType<FormPrTitleCheck>;
}
export const FormPrTitleCheckSettings = ({
  form,
}: FormPrTitleCheckSettingsProps) => {
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

        {form.values.enabled && (
          <>
            <TextInput
              label="Title Pattern"
              withAsterisk
              description="Set the regular expression which PR titles must match."
              placeholder="^\[[A-Za-z]+-\d+\] .+$"
              maxLength={100}
              {...form.getInputProps("settings.regex")}
            />

            <TextInput
              label="Example Value"
              withAsterisk
              description="Displayed in GitHub for developers to understand how to comply to the pattern."
              placeholder="[KEY-100] Title"
              maxLength={100}
              {...form.getInputProps("settings.regexExample")}
            />

            <Anchor
              fz="sm"
              ml="auto"
              target="_blank"
              href="https://docs.sweetr.dev/features/automations/pr-title-check#popular-patterns"
              rel="noreferrer"
              w="fit-content"
            >
              <Group gap={5} align="center">
                RegEx for popular title patterns
                <IconExternalLink stroke={1.5} size={16} />
              </Group>
            </Anchor>
          </>
        )}
      </Stack>
    </>
  );
};
