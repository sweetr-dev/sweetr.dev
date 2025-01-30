import { IntegrationApp } from "@sweetr/graphql-types/api";
import { showSuccessNotification } from "../../../providers/notification.provider";
import { getErrorMessage } from "../../../providers/error-message.provider";
import { useSendTestMessageMutation } from "../../../api/integrations.api";
import { useWorkspace } from "../../../providers/workspace.provider";
import { showErrorNotification } from "../../../providers/notification.provider";

export const useSendTestMessage = () => {
  const { workspace } = useWorkspace();
  const { mutate, isPending: isSendingTestMessage } =
    useSendTestMessageMutation();

  const sendTestMessage = (channel: string) => {
    mutate(
      {
        input: {
          workspaceId: workspace.id,
          app: IntegrationApp.SLACK,
          channel: channel,
        },
      },
      {
        onError: (error) => {
          showErrorNotification({
            message: getErrorMessage(error),
          });
        },
        onSuccess: () => {
          showSuccessNotification({ message: "Test message sent" });
        },
      },
    );
  };

  return {
    sendTestMessage,
    isSendingTestMessage,
  };
};
