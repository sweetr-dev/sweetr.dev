import { DrawerScrollable } from "../../../../../components/drawer-scrollable";
import { useDrawerPage } from "../../../../../providers/drawer-page.provider";
import { FormUpsertApplication } from "../components/form-upsert-application/form-upsert-application";
import { Button } from "@mantine/core";
import { useUpsertApplication } from "../use-upsert-application";
import { useFilterSearchParameters } from "../../../../../providers/filter.provider";

export const ApplicationsCreatePage = () => {
  const searchParams = useFilterSearchParameters();

  const drawerProps = useDrawerPage({
    closeUrl: `/systems/applications/?${searchParams.toString()}`,
  });

  const { form, isPending, isFormValid, handleSave } = useUpsertApplication({
    onClose: drawerProps.onClose,
  });

  return (
    <>
      <DrawerScrollable
        position="right"
        opened={drawerProps.opened}
        onClose={drawerProps.onClose || (() => {})}
        size="lg"
        title="Create application"
        actions={
          <Button type="submit" disabled={!isFormValid} loading={isPending}>
            Create new application
          </Button>
        }
        onSubmit={handleSave}
      >
        <FormUpsertApplication form={form} />
      </DrawerScrollable>
    </>
  );
};
