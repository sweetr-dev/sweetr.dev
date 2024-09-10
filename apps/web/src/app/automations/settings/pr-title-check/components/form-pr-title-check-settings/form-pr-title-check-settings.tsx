import { Input } from "@mantine/core";
import { BoxSetting } from "../../../components/box-setting";
import { useForm } from "@mantine/form";
import { AutomationType } from "@sweetr/graphql-types/api";
import { useAutomationSettings } from "../../../use-automation";
import { IconInputValidation } from "../../../../../../components/icon-input-validation/icon-input-validation";
import { useDebouncedCallback } from "@mantine/hooks";
import { useRegExValidation } from "./use-regex-validation";

interface FormPrTitleCheckSettingsProps {
  settings: {
    regex: string;
    regexExample: string;
  };
}

export const FormPrTitleCheckSettings = ({
  settings,
}: FormPrTitleCheckSettingsProps) => {
  const { mutate } = useAutomationSettings(AutomationType.PR_TITLE_CHECK);
  const { validateRegEx, isValidExample, isValidRegEx } = useRegExValidation();

  const onValuesChange = useDebouncedCallback((values) => {
    if (!validateRegEx(values)) return;

    mutate({ settings: values });
  }, 500);

  const form = useForm<{
    regex: string;
    regexExample: string;
  }>({
    initialValues: {
      regex: settings.regex || "",
      regexExample: settings.regexExample || "",
    },
    onValuesChange,
  });

  return (
    <>
      <BoxSetting
        left="Title Pattern"
        description="Set the regular expression which PR titles must match."
      >
        <Input
          maw={200}
          placeholder="^\[[A-Za-z]+-\d+\] .+$"
          rightSection={<IconInputValidation isValid={isValidRegEx} />}
          value={form.values.regex}
          onChange={(e) => form.setFieldValue("regex", e.target.value)}
          maxLength={100}
        ></Input>
      </BoxSetting>

      <BoxSetting
        left="Example Value"
        description="This will show in GitHub for developers to understand what the pattern is."
      >
        <Input
          maw={200}
          placeholder="[KEY-100] Title"
          color="red"
          c="red"
          rightSection={<IconInputValidation isValid={isValidExample} />}
          value={form.values.regexExample}
          onChange={(e) => form.setFieldValue("regexExample", e.target.value)}
          maxLength={100}
        ></Input>
      </BoxSetting>
    </>
  );
};
