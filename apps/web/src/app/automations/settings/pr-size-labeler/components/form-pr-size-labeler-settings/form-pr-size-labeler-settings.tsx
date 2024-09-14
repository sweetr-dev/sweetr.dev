import { ColorInput, Group, Input } from "@mantine/core";
import { BoxSetting } from "../../../components/box-setting";
import { useForm } from "@mantine/form";
import { AutomationType } from "@sweetr/graphql-types/api";
import { useAutomationSettings } from "../../../use-automation";
import { useDebouncedCallback } from "@mantine/hooks";
import { colorPickerSwatches } from "../../../../../../providers/color.provider";
import { capitalize } from "radash";

type PrSizeLabelerSettings = {
  labels?: {
    huge?: {
      label?: string;
      color?: string;
    };
    large?: {
      label?: string;
      color?: string;
    };
    medium?: {
      label?: string;
      color?: string;
    };
    small?: {
      label?: string;
      color?: string;
    };
    tiny?: {
      label?: string;
      color?: string;
    };
  };
};

type FormValues = Required<PrSizeLabelerSettings>["labels"];

interface FormPrSizeLabelerSettingsProps {
  settings: PrSizeLabelerSettings;
}

export const FormPrSizeLabelerSettings = ({
  settings,
}: FormPrSizeLabelerSettingsProps) => {
  const { mutate } = useAutomationSettings(AutomationType.PR_SIZE_LABELER);

  const onValuesChange = useDebouncedCallback((values) => {
    mutate({ settings: { labels: values } });
  }, 500);

  const initialValues = {
    tiny: {
      label: settings.labels?.tiny?.label || "tiny",
      color: settings.labels?.tiny?.color || "#69db7c",
    },
    small: {
      label: settings.labels?.small?.label || "small",
      color: settings.labels?.small?.color || "#69db7c",
    },
    medium: {
      label: settings.labels?.medium?.label || "medium",
      color: settings.labels?.medium?.color || "#a6a7ab",
    },
    large: {
      label: settings.labels?.large?.label || "large",
      color: settings.labels?.large?.color || "#ff8787",
    },
    huge: {
      label: settings.labels?.huge?.label || "huge",
      color: settings.labels?.huge?.color || "#ff8787",
    },
  };

  const form = useForm<FormValues>({
    initialValues,
    onValuesChange,
  });

  return (
    <>
      {(Object.keys(initialValues) as Array<keyof typeof initialValues>).map(
        (size) => (
          <BoxSetting
            key={size}
            left={capitalize(size)}
            description={`Customize the "${size}" label`}
          >
            <Group gap={5}>
              <Input
                maw={140}
                placeholder={size}
                value={form.values[size]?.label}
                onChange={(e) =>
                  form.setFieldValue(`${size}.label`, e.target.value)
                }
                maxLength={100}
              ></Input>
              <ColorInput
                placeholder="#F0F0F0"
                swatches={colorPickerSwatches}
                swatchesPerRow={7}
                {...form.getInputProps(`${size}.color`)}
                maw={120}
                withEyeDropper={false}
              />
            </Group>
          </BoxSetting>
        ),
      )}
    </>
  );
};
