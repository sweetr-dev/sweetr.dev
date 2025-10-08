import { Button, Image, Group, Divider, Text, Stack } from "@mantine/core";
import { DrawerScrollable } from "../../../../../../../components/drawer-scrollable";
import { LoadableContent } from "../../../../../../../components/loadable-content";
import { useDrawerPage } from "../../../../../../../providers/drawer-page.provider";
import { useMessagingIntegration } from "../../../../../../../providers/integration.provider";
import { useDigest } from "../use-digest";
import { useForm, zodResolver } from "@mantine/form";
import { FormEventHandler, useEffect, useMemo } from "react";
import { FormWipDigest } from "../types";
import {
  DigestType,
  DigestFrequency,
} from "@sweetr/graphql-types/frontend/graphql";
import { useWorkspace } from "../../../../../../../providers/workspace.provider";
import { DigestBaseFields } from "../components/digest-base-fields";
import { AlertEnableSlack } from "../../../../../../../components/alert-enable-slack";
import { useTeamId } from "../../../use-team";
import {
  getBrowserTimezone,
  weekDays,
} from "../../../../../../../providers/date.provider";
import { DigestLoadingSkeleton } from "../components/digest-loading-skeleton";

export const TeamWipDigestPage = () => {
  const teamId = useTeamId();
  const { workspace } = useWorkspace();

  const { integration, query: integrationQuery } = useMessagingIntegration();
  const {
    digest,
    query: digestQuery,
    mutate,
    mutation,
  } = useDigest({
    teamId,
    type: DigestType.TEAM_WIP,
  });

  const drawerProps = useDrawerPage({
    closeUrl: `/teams/${teamId}/digests`,
  });

  const form = useForm<FormWipDigest>({
    mode: "controlled",
    validate: zodResolver(FormWipDigest),
    initialValues: {
      enabled: false,
      channel: "",
      frequency: DigestFrequency.WEEKLY,
      dayOfTheWeek: weekDays,
      timeOfDay: "09:00",
      timezone: getBrowserTimezone(),
    },
  });

  useEffect(() => {
    if (!digestQuery.isFetched) return;

    const values = {
      enabled: digest.enabled,
      channel: digest.channel ?? "",
      frequency: digest.frequency ?? DigestFrequency.WEEKLY,
      dayOfTheWeek: digest.dayOfTheWeek ?? weekDays,
      timeOfDay: digest.timeOfDay ?? "09:00",
      timezone: digest.timezone ?? getBrowserTimezone(),
    };
    form.setValues(values);
    form.resetDirty();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digestQuery.isFetched]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isFormValid = useMemo(() => !form.validate().hasErrors, [form.values]);

  const handleSave: FormEventHandler = async (event) => {
    event.preventDefault();

    if (form.validate().hasErrors) return;

    await mutate({
      ...form.values,
      teamId,
      type: DigestType.TEAM_WIP,
      workspaceId: workspace.id,
      frequency: form.values.frequency as DigestFrequency,
      settings: {},
    });
  };

  return (
    <DrawerScrollable
      {...drawerProps}
      title="Work In Progress Digest"
      actions={
        <Button
          type="submit"
          loading={mutation.isPending}
          disabled={!isFormValid || !integration}
        >
          Update digest
        </Button>
      }
      onSubmit={handleSave}
    >
      <LoadableContent
        whenLoading={<DigestLoadingSkeleton />}
        isLoading={integrationQuery.isLoading || digestQuery.isLoading}
        content={
          <>
            <Group bg="#1a1d20" justify="center">
              <Image src={digest.imageUrl} w="auto" h="auto" />
            </Group>
            <Divider />
            <Stack p="md">
              <Text>{digest.description}</Text>
            </Stack>
            <Divider />

            {!integration && (
              <Stack p="md">
                <AlertEnableSlack />
              </Stack>
            )}

            {integration && <DigestBaseFields form={form} />}
          </>
        }
      />
    </DrawerScrollable>
  );
};
