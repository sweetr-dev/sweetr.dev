import {
  Automation,
  AutomationType,
  MutationUpdateAutomationArgs,
} from "@sweetr/graphql-types/frontend/graphql";
import {
  useAutomationQuery,
  useUpdateAutomationMutation,
} from "../../../api/automation.api";
import { useWorkspace } from "../../../providers/workspace.provider";
import {
  showSuccessNotification,
  showErrorNotification,
} from "../../../providers/notification.provider";

export const useAutomationSettings = (type: AutomationType) => {
  const { workspace } = useWorkspace();
  const { mutate: triggerMutation, isPending } = useUpdateAutomationMutation({
    onSuccess: () => {
      showSuccessNotification({
        message: `Automation settings updated.`,
      });
    },
    onError: () => {
      showErrorNotification({
        message: "Something went wrong. Please try again.",
      });
    },
  });

  const mutate = (
    payload: Pick<
      MutationUpdateAutomationArgs["input"],
      "enabled" | "settings"
    >,
  ) => {
    triggerMutation({
      input: {
        workspaceId: workspace.id,
        type,
        ...payload,
      },
    });
  };

  const { data, isLoading } = useAutomationQuery({
    workspaceId: workspace.id,
    input: {
      type,
    },
  });

  return {
    automationSettings: data?.workspace.automation || undefined,
    isLoading,
    mutate,
    isMutating: isPending,
  };
};
