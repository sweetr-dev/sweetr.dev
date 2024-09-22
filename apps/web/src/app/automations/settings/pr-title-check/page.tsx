import { Stack, Title, Skeleton, Group, Text, Button } from "@mantine/core";
import { LoadableContent } from "../../../../components/loadable-content";
import { AutomationType } from "@sweetr/graphql-types/frontend/graphql";
import { useAutomationSettings } from "../use-automation";
import { FormPrTitleCheckSettings } from "./components/form-pr-title-check-settings";
import { useDrawerPage } from "../../../../providers/drawer-page.provider";
import { DrawerScrollable } from "../../../../components/drawer-scrollable";
import { ButtonDocs } from "../../../../components/button-docs";
import { useForm, zodResolver } from "@mantine/form";
import { FormEventHandler, useEffect, useMemo } from "react";
import { FormPrTitleCheck } from "./types";
import { HeaderAutomation } from "../components/header-automation";

export const AutomationPrTitleCheckPage = () => {
  const { automation, automationSettings, query, mutation, mutate } =
    useAutomationSettings(AutomationType.PR_TITLE_CHECK);

  const drawerProps = useDrawerPage({
    closeUrl: `/automations`,
  });

  const form = useForm<FormPrTitleCheck>({
    validate: zodResolver(FormPrTitleCheck),
  });

  useEffect(() => {
    const settings = automationSettings?.settings as
      | FormPrTitleCheck["settings"]
      | undefined
      | null;

    form.setValues({
      enabled: automationSettings?.enabled || false,
      settings: {
        regex: settings?.regex || "",
        regexExample: settings?.regexExample || "",
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automationSettings]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isFormValid = useMemo(() => !form.validate().hasErrors, [form.values]);

  const handleSave: FormEventHandler = async (event) => {
    event.preventDefault();

    if (form.validate().hasErrors) return;

    await mutate({
      settings: form.values.settings,
      enabled: form.values.enabled,
    });
  };

  return (
    <DrawerScrollable
      {...drawerProps}
      size={733}
      position="right"
      title={
        <Group gap="xs">
          <Text fz={28} lh="28px">
            {automation?.icon}
          </Text>
          <Title mb={0} order={2}>
            {automation?.title}
          </Title>
        </Group>
      }
      toolbar={automation.docsUrl && <ButtonDocs href={automation.docsUrl} />}
      actions={
        <Button
          type="submit"
          loading={mutation.isPending}
          disabled={!isFormValid}
        >
          Update automation
        </Button>
      }
      onSubmit={handleSave}
    >
      <LoadableContent
        whenLoading={
          <Stack p="md">
            <Skeleton h={200} />
            <Skeleton h={50} />
            <Skeleton h={70} />
            <Skeleton h={70} />
          </Stack>
        }
        isLoading={query.isLoading}
        content={
          <>
            <HeaderAutomation automation={automation} />

            {automationSettings && <FormPrTitleCheckSettings form={form} />}
          </>
        }
      />
    </DrawerScrollable>
  );
};
