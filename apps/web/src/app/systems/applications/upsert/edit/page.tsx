import { DrawerScrollable } from "../../../../../components/drawer-scrollable";
import { useDrawerPage } from "../../../../../providers/drawer-page.provider";
import { FormUpsertApplication } from "../components/form-upsert-application/form-upsert-application";
import { Box, Button, Skeleton } from "@mantine/core";
import { useUpsertApplication } from "../use-upsert-application";
import { useApplicationQuery } from "../../../../../api/applications.api";
import { useEffect } from "react";
import { useWorkspace } from "../../../../../providers/workspace.provider";
import { useParams } from "react-router-dom";
import { ResourceNotFound } from "../../../../../exceptions/resource-not-found.exception";
import { LoadableContent } from "../../../../../components/loadable-content";
import { useFilterSearchParameters } from "../../../../../providers/filter.provider";

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

  useEffect(() => {
    if (!isFetched || !application) return;

    const values = {
      name: application.name,
      description: application.description ?? undefined,
      repositoryId: application.repository.id,
      teamId: application.team?.id,
      deploymentSettings: {
        trigger: application.deploymentSettings.trigger,
        subdirectory: application.deploymentSettings.subdirectory ?? "",
      },
    };
    form.setValues(values);
    form.resetDirty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetched]);

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
