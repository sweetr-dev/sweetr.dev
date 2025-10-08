import {
  AlertType,
  MutationUpdateAlertArgs,
} from "@sweetr/graphql-types/frontend/graphql";
import { useWorkspace } from "../../../../../../providers/workspace.provider";
import {
  showSuccessNotification,
  showErrorNotification,
} from "../../../../../../providers/notification.provider";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../../../../../providers/error-message.provider";
import { useAlertCards } from "../use-alert-cards";
import {
  useTeamAlertQuery,
  useUpdateAlertMutation,
} from "../../../../../../api/alert.api";
import { FormEventHandler, useMemo } from "react";
import { UseFormReturnType } from "@mantine/form";
import { BaseFormAlert } from "./types";
import { useDrawerPage } from "../../../../../../providers/drawer-page.provider";

interface UseAlertsProps<T> {
  teamId: string;
  type: AlertType;
  form: UseFormReturnType<T>;
}

export const useAlert = <T extends BaseFormAlert>({
  teamId,
  type,
  form,
}: UseAlertsProps<T>) => {
  const { workspace } = useWorkspace();
  const { alertCards } = useAlertCards();
  const alertCard = alertCards[type];
  const navigate = useNavigate();

  const { mutate: triggerMutation, ...mutation } = useUpdateAlertMutation({
    onSuccess: () => {
      showSuccessNotification({
        message: `Alert updated.`,
      });

      navigate(`/humans/teams/${teamId}/alerts`);
    },
    onError: (error) => {
      showErrorNotification({
        message: getErrorMessage(error),
      });
    },
  });

  const mutate = (input: MutationUpdateAlertArgs["input"]) => {
    triggerMutation({
      input,
    });
  };

  const { data, ...query } = useTeamAlertQuery({
    workspaceId: workspace.id,
    teamId,
    input: {
      type,
    },
  });

  const handleUpdate: FormEventHandler = async (event) => {
    event.preventDefault();

    if (form.validate().hasErrors) return;

    await mutate({
      ...form.values,
      teamId,
      type,
      workspaceId: workspace.id,
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isFormValid = useMemo(() => !form.validate().hasErrors, [form.values]);

  const drawerProps = useDrawerPage({
    closeUrl: `/humans/teams/${teamId}/alerts`,
  });

  return {
    alert: {
      ...alertCard,
      ...data?.workspace.team?.alert,
    },
    query,
    mutate,
    mutation,
    isUpdating: mutation.isPending,
    handleUpdate,
    isFormValid,
    drawerProps,
  };
};
