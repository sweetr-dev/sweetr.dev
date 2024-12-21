import { Stack, Title, Skeleton, Button, Group, Text } from "@mantine/core";
import { LoadableContent } from "../../../../components/loadable-content";
import { AutomationType } from "@sweetr/graphql-types/frontend/graphql";
import { useAutomationSettings } from "../use-automation";
import { HeaderAutomation } from "../components/header-automation";
import { FormPrSizeLabelerSettings } from "./components/form-pr-size-labeler-settings";
import { ButtonDocs } from "../../../../components/button-docs";
import { DrawerScrollable } from "../../../../components/drawer-scrollable";
import { useForm, zodResolver } from "@mantine/form";
import { useEffect, useMemo, FormEventHandler } from "react";
import { useDrawerPage } from "../../../../providers/drawer-page.provider";
import { FormPrSizeLabeler } from "./types";

export const AutomationPrSizeLabelerPage = () => {
  const { automation, automationSettings, query, mutation, mutate } =
    useAutomationSettings(AutomationType.PR_SIZE_LABELER);

  const drawerProps = useDrawerPage({
    closeUrl: `/automations`,
  });

  const form = useForm<FormPrSizeLabeler>({
    validate: zodResolver(FormPrSizeLabeler),
  });

  useEffect(() => {
    const settings = automationSettings?.settings as
      | FormPrSizeLabeler["settings"]
      | undefined
      | null;

    form.setValues({
      enabled: automationSettings?.enabled || false,
      settings: {
        labels: {
          tiny: {
            label: settings?.labels?.tiny?.label || "tiny",
            color: settings?.labels?.tiny?.color || "#69db7c",
          },
          small: {
            label: settings?.labels?.small?.label || "small",
            color: settings?.labels?.small?.color || "#69db7c",
          },
          medium: {
            label: settings?.labels?.medium?.label || "medium",
            color: settings?.labels?.medium?.color || "#a6a7ab",
          },
          large: {
            label: settings?.labels?.large?.label || "large",
            color: settings?.labels?.large?.color || "#ff8787",
          },
          huge: {
            label: settings?.labels?.huge?.label || "huge",
            color: settings?.labels?.huge?.color || "#ff8787",
          },
        },
        repositories: [],
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
            <FormPrSizeLabelerSettings form={form} />
          </>
        }
      />
    </DrawerScrollable>
  );
};
