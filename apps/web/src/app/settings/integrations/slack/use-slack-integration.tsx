import { useEffect } from "react";
import {
  showSuccessNotification,
  showErrorNotification,
  showInfoNotification,
  errorNotificationProps,
  successNotificationProps,
} from "../../../../providers/notification.provider";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useInstallIntegrationMutation,
  useRemoveIntegrationMutation,
} from "../../../../api/integrations.api";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { IntegrationApp } from "@sweetr/graphql-types/frontend/graphql";
import { notifications } from "@mantine/notifications";

export const useSlackIntegration = () => {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { mutate: installMutation } = useInstallIntegrationMutation();
  const { mutate: removeMutation } = useRemoveIntegrationMutation();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  useEffect(() => {
    if (!code || !state) return;

    installMutation(
      {
        input: {
          workspaceId: workspace.id,
          app: IntegrationApp.SLACK,
          code,
          state: decodeURIComponent(state),
        },
      },
      {
        onSuccess: () => {
          showSuccessNotification({
            message: "Slack successfully integrated.",
          });
        },
        onError: () => {
          showErrorNotification({
            message: "Something went wrong. Please re-install the app.",
          });
        },
        onSettled: () => {
          navigate("/settings/integrations/slack");
        },
      },
    );
  }, [code, installMutation, navigate, state, workspace.id]);

  const handleUninstall = () => {
    const notificationId = showInfoNotification({
      title: "Uninstalling Slack",
      loading: true,
      autoClose: false,
      withCloseButton: false,
    });

    removeMutation(
      {
        input: {
          app: IntegrationApp.SLACK,
          workspaceId: workspace.id,
        },
      },
      {
        onSuccess: () => {
          notifications.update({
            id: notificationId,
            ...successNotificationProps,
            message: "Slack was uninstalled.",
            loading: false,
            autoClose: true,
            withCloseButton: true,
          });
        },
        onError: () => {
          notifications.update({
            id: notificationId,
            ...errorNotificationProps,
            title: "Uninstall Slack",
            message: "Something went wrong. Please try again.",
            loading: false,
            autoClose: true,
            withCloseButton: true,
          });
        },
        onSettled: () => {
          navigate("/settings/integrations");
        },
      },
    );
  };

  return {
    isIntegrating: !!code,
    handleUninstall,
  };
};
