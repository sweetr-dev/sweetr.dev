import { DrawerScrollable } from "../../../../../components/drawer-scrollable";
import { useDrawerPage } from "../../../../../providers/drawer-page.provider";
import { FormUpsertIncident } from "../components/form-upsert-incident/form-upsert-incident";
import { Box, Button, Skeleton } from "@mantine/core";
import { useUpsertIncident } from "../use-upsert-incident";
import { useIncidentQuery } from "../../../../../api/incidents.api";
import { useEffect } from "react";
import { useWorkspace } from "../../../../../providers/workspace.provider";
import { useParams } from "react-router-dom";
import { ResourceNotFound } from "../../../../../exceptions/resource-not-found.exception";
import { LoadableContent } from "../../../../../components/loadable-content";
import { useFilterSearchParameters } from "../../../../../providers/filter.provider";

export const IncidentsEditPage = () => {
  const searchParams = useFilterSearchParameters();

  const drawerProps = useDrawerPage({
    closeUrl: `/systems/incidents/?${searchParams.toString()}`,
  });
  const { incidentId } = useParams();

  if (!incidentId) throw new ResourceNotFound();

  const { workspace } = useWorkspace();

  const { data, isLoading, isFetched } = useIncidentQuery({
    workspaceId: workspace.id,
    incidentId,
  });

  const incident = data?.workspace.incident;

  const { form, isPending, isFormValid, handleSave } = useUpsertIncident({
    incidentId,
    onClose: drawerProps.onClose,
  });

  useEffect(() => {
    if (!isFetched || !incident) return;

    const values = {
      teamId: incident.team?.id,
      leaderId: incident.leader?.id,
      detectedAt: incident.detectedAt,
      resolvedAt: incident.resolvedAt ? incident.resolvedAt : null,
      causeDeploymentId: incident.causeDeployment.id,
      fixDeploymentId: incident.fixDeployment?.id || null,
      postmortemUrl: incident.postmortemUrl || "",
    };
    form.setValues(values);
    form.resetDirty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetched]);

  return (
    <>
      <DrawerScrollable
        {...drawerProps}
        title="Edit incident"
        actions={
          <Button type="submit" disabled={!isFormValid} loading={isPending}>
            Update incident
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
          content={
            <FormUpsertIncident
              form={form}
              applicationId={incident?.causeDeployment.application.id}
            />
          }
        />
      </DrawerScrollable>
    </>
  );
};
