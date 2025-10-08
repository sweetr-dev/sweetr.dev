import { DrawerScrollable } from "../../../../../components/drawer-scrollable";
import { useDrawerPage } from "../../../../../providers/drawer-page.provider";
import { FormUpsertIncident } from "../components/form-upsert-incident/form-upsert-incident";
import { Button } from "@mantine/core";
import { useUpsertIncident } from "../use-upsert-incident";
import { useFilterSearchParameters } from "../../../../../providers/filter.provider";

export const IncidentsCreatePage = () => {
  const searchParams = useFilterSearchParameters();

  const drawerProps = useDrawerPage({
    closeUrl: `/systems/incidents/?${searchParams.toString()}`,
  });

  const { form, isPending, handleSave } = useUpsertIncident({
    onClose: drawerProps.onClose,
  });

  return (
    <>
      <DrawerScrollable
        {...drawerProps}
        title="Create incident"
        actions={
          <Button type="submit" loading={isPending}>
            Create new incident
          </Button>
        }
        onSubmit={handleSave}
      >
        <FormUpsertIncident form={form} />
      </DrawerScrollable>
    </>
  );
};
