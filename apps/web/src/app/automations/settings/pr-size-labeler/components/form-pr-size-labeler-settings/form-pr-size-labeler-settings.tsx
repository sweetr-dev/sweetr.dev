import { ColorInput, Group, Input, Stack, Switch, Title } from "@mantine/core";
import { BoxSetting } from "../../../components/box-setting";
import { UseFormReturnType } from "@mantine/form";
import { colorPickerSwatches } from "../../../../../../providers/color.provider";
import { capitalize } from "radash";
import { FormPrSizeLabeler } from "../../types";

interface FormPrSizeLabelerSettingsProps {
  form: UseFormReturnType<FormPrSizeLabeler>;
}

export const FormPrSizeLabelerSettings = ({
  form,
}: FormPrSizeLabelerSettingsProps) => {
  return (
    <Stack p="md">
      <Title order={5}>Settings</Title>

      <BoxSetting left="Enabled">
        <Switch
          size="lg"
          color="green.7"
          onLabel="ON"
          offLabel="OFF"
          {...form.getInputProps("enabled", { type: "checkbox" })}
        />
      </BoxSetting>

      {form.values.enabled &&
        (
          Object.keys(form.values.settings.labels) as Array<
            keyof typeof form.values.settings.labels
          >
        ).map((size) => (
          <BoxSetting
            key={size}
            left={capitalize(size)}
            description={`Customize the "${size}" label`}
          >
            <Group gap={5}>
              <Input
                maw={140}
                placeholder={size}
                {...form.getInputProps(`settings.labels.${size}.label`)}
                maxLength={100}
              ></Input>
              <ColorInput
                placeholder="#F0F0F0"
                error={false}
                swatches={colorPickerSwatches}
                swatchesPerRow={7}
                {...form.getInputProps(`settings.labels.${size}.color`)}
                maw={120}
                withEyeDropper={false}
              />
            </Group>
          </BoxSetting>
        ))}
    </Stack>
  );
};
