import {
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
import { useAutomationCards } from "../use-automation-cards";
import { useNavigate } from "react-router-dom";

export const useAutomationSettings = (type: AutomationType) => {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { automationCards } = useAutomationCards();
  const automation = automationCards[type];
  const { mutate: triggerMutation, ...mutation } = useUpdateAutomationMutation({
    onSuccess: () => {
      showSuccessNotification({
        message: `Automation settings updated.`,
      });

      navigate("/automations");
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

  const { data, ...query } = useAutomationQuery({
    workspaceId: workspace.id,
    input: {
      type,
    },
  });

  return {
    automation,
    automationSettings: data?.workspace.automation || undefined,
    query,
    mutate,
    mutation,
  };
};
