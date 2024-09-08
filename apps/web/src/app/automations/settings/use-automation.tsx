import {
  Automation,
  AutomationType,
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

interface UseAutomations {
  automationSettings: Automation | undefined;
  isLoading: boolean;
  mutate: (isEnabled: boolean, settings: object) => void;
  isMutating: boolean;
}

export const useAutomationSettings = (type: AutomationType): UseAutomations => {
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

  const mutate = (isEnabled: boolean, settings: object) => {
    triggerMutation({
      input: {
        workspaceId: workspace.id,
        type,
        enabled: isEnabled,
        settings,
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
