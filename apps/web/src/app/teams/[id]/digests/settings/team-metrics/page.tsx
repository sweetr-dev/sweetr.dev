import { Button, Image, Group, Divider, Text, Stack } from "@mantine/core";
import { DrawerScrollable } from "../../../../../../components/drawer-scrollable";
import { LoadableContent } from "../../../../../../components/loadable-content";
import { useDrawerPage } from "../../../../../../providers/drawer-page.provider";
import { useMessagingIntegration } from "../../../../../../providers/integration.provider";
import { useDigest } from "../use-digest";
import { useForm, zodResolver } from "@mantine/form";
import { FormEventHandler, useEffect, useMemo } from "react";
import { FormMetricsDigest } from "../types";
import {
  DayOfTheWeek,
  DigestType,
  DigestFrequency,
} from "@sweetr/graphql-types/frontend/graphql";
import { useWorkspace } from "../../../../../../providers/workspace.provider";
import {
  DigestBaseFields,
  DigestLoadingSkeleton,
} from "../components/digest-base-fields";
import { AlertEnableSlack } from "../components/alert-enable-slack";
import { useTeamId } from "../../../use-team";
import { getBrowserTimezone } from "../../../../../../providers/date.provider";

export const TeamMetricsDigestPage = () => {
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
    type: DigestType.TEAM_METRICS,
  });

  const drawerProps = useDrawerPage({
    closeUrl: `/teams/${teamId}/digests`,
  });

  const form = useForm<FormMetricsDigest>({
    mode: "controlled",
    validate: zodResolver(FormMetricsDigest),
    initialValues: {
      enabled: false,
      channel: "",
      frequency: DigestFrequency.MONTHLY,
      dayOfTheWeek: [DayOfTheWeek.MONDAY],
      timeOfDay: "09:00",
      timezone: getBrowserTimezone(),
    },
  });

  useEffect(() => {
    if (!digestQuery.isFetched) return;

    const values = {
      enabled: digest.enabled,
      channel: digest.channel ?? "",
      frequency: digest.frequency ?? DigestFrequency.MONTHLY,
      dayOfTheWeek: digest.dayOfTheWeek ?? [DayOfTheWeek.MONDAY],
      timeOfDay: digest.timeOfDay ?? "09:00",
      timezone: digest.timezone ?? getBrowserTimezone(),
    };
    form.setInitialValues(values);
    form.setValues(values);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digestQuery.isFetched]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isFormValid = useMemo(() => form.isValid(), [form.values]);

  const handleSave: FormEventHandler = async (event) => {
    event.preventDefault();

    if (form.validate().hasErrors) return;

    await mutate({
      ...form.values,
      teamId,
      type: DigestType.TEAM_METRICS,
      workspaceId: workspace.id,
      frequency: form.values.frequency as DigestFrequency,
      settings: {},
    });
  };

  return (
    <DrawerScrollable
      {...drawerProps}
      title="Metrics Digest"
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
