import { Stack, Title, Skeleton, Group, Text, Button } from "@mantine/core";
import { LoadableContent } from "../../../../components/loadable-content";
import { AutomationType } from "@sweetr/graphql-types/frontend/graphql";
import { useAutomationSettings } from "../use-automation";
import { FormIncidentDetectionSettings } from "./components/form-incident-detection-settings";
import { useDrawerPage } from "../../../../providers/drawer-page.provider";
import { DrawerScrollable } from "../../../../components/drawer-scrollable";
import { ButtonDocs } from "../../../../components/button-docs";
import { useForm, zodResolver } from "@mantine/form";
import { FormEventHandler, useEffect, useMemo } from "react";
import { FormIncidentDetection } from "./types";
import { HeaderAutomation } from "../components/header-automation";

const defaultValues: FormIncidentDetection = {
  enabled: false,
  settings: {
    revert: {
      enabled: true,
    },
    hotfix: {
      enabled: true,
      prTitleRegEx: "hotfix",
      branchRegEx: "^hotfix",
      prLabelRegEx: "hotfix",
    },
    rollback: {
      enabled: true,
    },
  },
};

export const AutomationIncidentDetectionPage = () => {
  const { automation, automationSettings, query, mutation, mutate } =
    useAutomationSettings(AutomationType.INCIDENT_DETECTION);

  const drawerProps = useDrawerPage({
    closeUrl: `/automations`,
  });

  const form = useForm<FormIncidentDetection>({
    validate: zodResolver(FormIncidentDetection),
  });

  useEffect(() => {
    const settings = automationSettings?.settings as
      | FormIncidentDetection["settings"]
      | undefined
      | null;

    form.setValues({
      enabled: automationSettings?.enabled || false,
      settings: {
        revert: {
          enabled:
            settings?.revert?.enabled ?? defaultValues.settings.revert.enabled,
        },
        rollback: {
          enabled:
            settings?.rollback?.enabled ??
            defaultValues.settings.rollback.enabled,
        },
        hotfix: {
          enabled:
            settings?.hotfix?.enabled ?? defaultValues.settings.hotfix.enabled,
          prTitleRegEx:
            settings?.hotfix?.prTitleRegEx ??
            defaultValues.settings.hotfix.prTitleRegEx,
          branchRegEx:
            settings?.hotfix?.branchRegEx ??
            defaultValues.settings.hotfix.branchRegEx,
          prLabelRegEx:
            settings?.hotfix?.prLabelRegEx ??
            defaultValues.settings.hotfix.prLabelRegEx,
        },
      },
    });
    form.resetDirty();
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
      toolbar={automation?.docsUrl && <ButtonDocs href={automation.docsUrl} />}
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
            <FormIncidentDetectionSettings form={form} />
          </>
        }
      />
    </DrawerScrollable>
  );
};
