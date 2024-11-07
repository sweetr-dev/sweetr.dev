import {
  Button,
  Skeleton,
  Image,
  Group,
  Divider,
  Text,
  Stack,
  Alert,
} from "@mantine/core";
import { Link, useParams } from "react-router-dom";
import { DrawerScrollable } from "../../../../../../components/drawer-scrollable";
import { LoadableContent } from "../../../../../../components/loadable-content";
import { ResourceNotFound } from "../../../../../../exceptions/resource-not-found.exception";
import { useDrawerPage } from "../../../../../../providers/drawer-page.provider";
import { useMessagingIntegration } from "../../../../../../providers/integration.provider";
import { IconAlertHexagon, IconExternalLink } from "@tabler/icons-react";
import { FormDigestMetrics } from "./components";
import { useDigest } from "../use-digest";
import { useForm, zodResolver } from "@mantine/form";
import { FormEventHandler, useEffect, useMemo } from "react";
import { FormMetricsDigest } from "./types";
import { DigestType, Frequency } from "@sweetr/graphql-types/frontend/graphql";
import { useWorkspace } from "../../../../../../providers/workspace.provider";

export const TeamDigestMetricsPage = () => {
  const { teamId } = useParams();
  const { workspace } = useWorkspace();

  if (!teamId) throw new ResourceNotFound();

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
      frequency: "",
      dayOfTheWeek: 1,
      timeOfDay: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  useEffect(() => {
    if (!digestQuery.isFetched) return;

    const values = {
      enabled: digest.enabled,
      channel: digest.channel ?? "",
      frequency: digest.frequency ?? "",
      dayOfTheWeek: digest.dayOfTheWeek ?? 1,
      timeOfDay: digest.timeOfDay ?? "",
      timezone:
        digest.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
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
      frequency: form.values.frequency as Frequency,
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
          disabled={!isFormValid}
        >
          Update digest
        </Button>
      }
      onSubmit={handleSave}
    >
      <LoadableContent
        whenLoading={
          <>
            <Skeleton h={50} />
            <Skeleton h={175} mt={24} />
            <Skeleton h={232} mt="lg" />
            <Skeleton h={36} mt="lg" />
          </>
        }
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
                <Alert
                  variant="light"
                  color="violet"
                  styles={{
                    wrapper: {
                      alignItems: "center",
                    },
                  }}
                  icon={<IconAlertHexagon stroke={1.5} />}
                >
                  <Group justify="space-between">
                    <Text>
                      Setup integration with Slack to enable this feature.
                    </Text>
                    <Button
                      size="xs"
                      variant="filled"
                      component={Link}
                      target="_blank"
                      to={`/settings/integrations/slack`}
                      color="violet"
                      rightSection={<IconExternalLink stroke={1.5} size={16} />}
                    >
                      Enable
                    </Button>
                  </Group>
                </Alert>
              </Stack>
            )}

            {integration && <FormDigestMetrics form={form} />}
          </>
        }
      />
    </DrawerScrollable>
  );
};
