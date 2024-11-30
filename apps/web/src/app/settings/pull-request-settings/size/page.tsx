import { Button, Skeleton, Stack } from "@mantine/core";
import { DrawerScrollable } from "../../../../components/drawer-scrollable";
import { useDrawerPage } from "../../../../providers/drawer-page.provider";
import { useForm, zodResolver } from "@mantine/form";
import { PullRequestSizeSettings } from "./components/types";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { FormPullRequestSizeSettings } from "./components/form-pull-request-size-settings";
import { FormEventHandler, useEffect, useMemo } from "react";
import {
  useUpdateWorkspaceSettingsMutation,
  useWorkspaceSettingsQuery,
} from "../../../../api/workspaces.api";
import { showErrorNotification } from "../../../../providers/notification.provider";
import { showSuccessNotification } from "../../../../providers/notification.provider";
import { useNavigate } from "react-router-dom";
import { LoadableContent } from "../../../../components/loadable-content";

export const PullRequestSizePage = () => {
  const drawerProps = useDrawerPage({
    closeUrl: `/settings/pull-request`,
  });
  const { workspace } = useWorkspace();
  const navigate = useNavigate();

  const { data, isLoading } = useWorkspaceSettingsQuery({
    workspaceId: workspace.id,
  });

  const { mutate, isPending } = useUpdateWorkspaceSettingsMutation({
    onSuccess: () => {
      showSuccessNotification({
        message: `Size settings updated.`,
      });

      navigate("/settings/pull-request");
    },
    onError: () => {
      showErrorNotification({
        message: "Something went wrong. Please try again.",
      });
    },
  });

  useEffect(() => {
    const settings = data?.workspace.settings;

    form.setValues({
      workspaceId: workspace.id,
      settings,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const form = useForm<PullRequestSizeSettings>({
    validate: zodResolver(PullRequestSizeSettings),
  });

  const isFormValid = useMemo(() => form.isValid(), [form]);

  const handleSave: FormEventHandler = async (event) => {
    event.preventDefault();

    if (form.validate().hasErrors) return;

    await mutate({
      input: {
        workspaceId: workspace.id,
        settings: form.values.settings,
      },
    });
  };

  return (
    <DrawerScrollable
      {...drawerProps}
      title="Pull Request Size"
      actions={
        <>
          <Button type="submit" loading={isPending} disabled={!isFormValid}>
            Save
          </Button>
        </>
      }
      onSubmit={handleSave}
      size={600}
    >
      <LoadableContent
        isLoading={isLoading}
        content={<FormPullRequestSizeSettings form={form} />}
        whenLoading={
          <Stack p="md">
            <Skeleton w="100%" h={300} />
            <Skeleton w="100%" h={100} />
            <Skeleton w="100%" h={100} />
          </Stack>
        }
      />
    </DrawerScrollable>
  );
};
