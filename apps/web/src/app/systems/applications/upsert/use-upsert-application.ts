import { useForm, zodResolver } from "@mantine/form";
import { DeploymentSettingsTrigger } from "@sweetr/graphql-types/frontend/graphql";
import { FormEventHandler } from "react";
import { useNavigate } from "react-router-dom";
import { useUpsertApplicationMutation } from "../../../../api/applications.api";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../../../providers/notification.provider";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { ApplicationForm } from "../types";

interface UseUpsertApplicationProps {
  applicationId?: string;
  onClose: () => void;
}

export const useUpsertApplication = ({
  onClose,
  applicationId,
}: UseUpsertApplicationProps) => {
  const { workspace } = useWorkspace();

  const navigate = useNavigate();
  const isEditing = !!applicationId;

  const form = useForm<ApplicationForm>({
    initialValues: {
      applicationId,
      workspaceId: workspace.id,
      name: "",
      description: "",
      repositoryId: "",
      teamId: "",
      deploymentSettings: {
        trigger: DeploymentSettingsTrigger.WEBHOOK,
        subdirectory: "",
        targetBranch: null,
      },
    },
    validate: zodResolver(ApplicationForm),
  });

  const { mutate, isPending } = useUpsertApplicationMutation({
    onSuccess: () => {
      const message = isEditing
        ? "Application updated"
        : "New application created";
      showSuccessNotification({ message });

      onClose();
      navigate(`/systems/applications`);
    },
    onError: () => {
      showErrorNotification({
        message: "Something went wrong. Please try again.",
      });
    },
  });

  const handleSave: FormEventHandler = async (event) => {
    event.preventDefault();

    if (form.validate().hasErrors) return;

    await mutate({
      input: { ...form.values, teamId: form.values.teamId || null },
    });
  };

  return { form, isPending, handleSave };
};
