import { Box, Button, Skeleton } from "@mantine/core";
import { DeploymentSettingsTrigger } from "@sweetr/graphql-types/frontend/graphql";
import { useParams } from "react-router-dom";
import { useApplicationQuery } from "../../../../../api/applications.api";
import { DrawerScrollable } from "../../../../../components/drawer-scrollable";
import { LoadableContent } from "../../../../../components/loadable-content";
import { ResourceNotFound } from "../../../../../exceptions/resource-not-found.exception";
import { useDrawerPage } from "../../../../../providers/drawer-page.provider";
import { useFilterSearchParameters } from "../../../../../providers/filter.provider";
import { useFormAsyncData } from "../../../../../providers/form.provider";
import { useWorkspace } from "../../../../../providers/workspace.provider";
import { FormUpsertApplication } from "../components/form-upsert-application/form-upsert-application";
import { useUpsertApplication } from "../use-upsert-application";

export const ApplicationsEditPage = () => {
  const searchParams = useFilterSearchParameters();

  const drawerProps = useDrawerPage({
    closeUrl: `/systems/applications/?${searchParams.toString()}`,
  });
  const { applicationId } = useParams();

  if (!applicationId) throw new ResourceNotFound();

  const { workspace } = useWorkspace();

  const { data, isLoading, isFetched } = useApplicationQuery({
    workspaceId: workspace.id,
    applicationId,
  });

  const application = data?.workspace.application;

  const { form, isPending, handleSave } = useUpsertApplication({
    applicationId,
    onClose: drawerProps.onClose,
  });

  useFormAsyncData({
    isFetched,
    form,
    values: {
      workspaceId: workspace.id,
      name: application?.name || "",
      description: application?.description ?? undefined,
      repositoryId: application?.repository.id || "",
      teamId: application?.team?.id,
      deploymentSettings: {
        trigger:
          application?.deploymentSettings.trigger ||
          DeploymentSettingsTrigger.WEBHOOK,
        subdirectory: application?.deploymentSettings.subdirectory ?? "",
        targetBranch: application?.deploymentSettings.targetBranch ?? "",
      },
    },
  });

  return (
    <>
      <DrawerScrollable
        {...drawerProps}
        title="Edit application"
        actions={
          <Button type="submit" loading={isPending}>
            Update application
          </Button>
        }
        onSubmit={handleSave}
      >
        <LoadableContent
          isLoading={isLoading}
          whenLoading={
            <Box p="md">
              <Skeleton w="100%" h={300} />
            </Box>
          }
          content={<FormUpsertApplication form={form} />}
        />
      </DrawerScrollable>
    </>
  );
};
