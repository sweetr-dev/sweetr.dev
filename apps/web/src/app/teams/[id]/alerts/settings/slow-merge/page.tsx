import {
  Button,
  Text,
  Divider,
  Stack,
  Input,
  Slider,
  Title,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { DrawerScrollable } from "../../../../../../components/drawer-scrollable";
import { LoadableContent } from "../../../../../../components/loadable-content";
import { useMessagingIntegration } from "../../../../../../providers/integration.provider";
import { AlertEnableSlack } from "../../../../../../components/alert-enable-slack";
import { useTeamId } from "../../../use-team";
import { AlertLoadingSkeleton } from "../../components/alert-loading-skeleton";
import { AlertBaseFields } from "../../components/alert-base-fields";
import { useAlert } from "../use-alert";
import { AlertType } from "@sweetr/graphql-types/frontend/graphql";
import { FormSlowMergeAlert } from "../types";
import { useFormAsyncData } from "../../../../../../providers/form.provider.ts";
import { TriggerDescription } from "../components/trigger-description";

export const SlowMergeAlertPage = () => {
  const teamId = useTeamId();
  const { integration, query: integrationQuery } = useMessagingIntegration();

  const initialValues = {
    enabled: false,
    channel: "",
    settings: {
      maxWaitInHours: 2,
    },
  };

  const form = useForm<FormSlowMergeAlert>({
    mode: "controlled",
    validate: zodResolver(FormSlowMergeAlert),
    initialValues,
  });

  const {
    alert,
    query: alertQuery,
    isUpdating,
    handleUpdate,
    isFormValid,
    drawerProps,
  } = useAlert({
    teamId,
    type: AlertType.SLOW_MERGE,
    form,
  });

  const settings = alert?.settings as
    | FormSlowMergeAlert["settings"]
    | undefined
    | null;

  useFormAsyncData({
    isFetched: alertQuery.isFetched,
    form,
    values: {
      enabled: alert.enabled || initialValues.enabled,
      channel: alert.channel || initialValues.channel,
      settings: settings || initialValues.settings,
    },
  });

  return (
    <DrawerScrollable
      {...drawerProps}
      title={alert.title}
      actions={
        <Button
          type="submit"
          loading={isUpdating}
          disabled={!isFormValid || !integration}
        >
          Update alert
        </Button>
      }
      onSubmit={handleUpdate}
    >
      <LoadableContent
        whenLoading={<AlertLoadingSkeleton />}
        isLoading={integrationQuery.isLoading || alertQuery.isLoading}
        content={
          <>
            <Stack p="md">
              <Text>{alert.description}</Text>
              <TriggerDescription type="cron" label="every 15 minutes" />
            </Stack>
            <Divider />

            {!integration && (
              <Stack p="md">
                <AlertEnableSlack />
              </Stack>
            )}

            {integration && (
              <>
                <AlertBaseFields form={form} />
                {form.values.enabled && (
                  <>
                    <Divider my="md" />
                    <Stack p="md" pb="xl">
                      <Title order={5}>Trigger</Title>
                      <Input.Wrapper>
                        <Input.Label>
                          An approved Pull Request is pending merge for more
                          than{" "}
                          <Text
                            component="span"
                            c="green"
                            fz="inherit"
                            fw="inherit"
                          >
                            {form.values.settings.maxWaitInHours} hours
                          </Text>
                        </Input.Label>
                        <Slider
                          mt="xs"
                          min={1}
                          max={7 * 24}
                          label={(value) => `${value} hours`}
                          {...form.getInputProps("settings.maxWaitInHours")}
                        />
                        <Input.Description mt="xs">
                          Weekends are not included in the calculation.
                        </Input.Description>
                      </Input.Wrapper>
                    </Stack>
                  </>
                )}
              </>
            )}
          </>
        }
      />
    </DrawerScrollable>
  );
};
