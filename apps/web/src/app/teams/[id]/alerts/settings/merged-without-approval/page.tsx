import { Button, Text, Divider, Stack } from "@mantine/core";
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
import { FormMergedWithoutReviewAlert } from "../types";
import { useFormAsyncData } from "../../../../../../providers/form.provider.ts";

export const MergedWithoutApprovalAlertPage = () => {
  const teamId = useTeamId();
  const { integration, query: integrationQuery } = useMessagingIntegration();

  const initialValues = {
    enabled: false,
    channel: "",
  };

  const form = useForm<FormMergedWithoutReviewAlert>({
    mode: "controlled",
    validate: zodResolver(FormMergedWithoutReviewAlert),
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
    type: AlertType.MERGED_WITHOUT_APPROVAL,
    form,
  });

  useFormAsyncData({
    isFetched: alertQuery.isFetched,
    form,
    values: {
      enabled: alert.enabled || initialValues.enabled,
      channel: alert.channel || initialValues.channel,
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
              </>
            )}
          </>
        }
      />
    </DrawerScrollable>
  );
};
