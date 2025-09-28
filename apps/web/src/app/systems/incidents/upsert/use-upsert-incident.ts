import { useForm, zodResolver } from "@mantine/form";
import { FormEventHandler, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  showSuccessNotification,
  showErrorNotification,
} from "../../../../providers/notification.provider";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { IncidentForm } from "../types";
import { useUpsertIncidentMutation } from "../../../../api/incidents.api";
import { UTCDate } from "@date-fns/utc";

interface UseUpsertIncidentProps {
  incidentId?: string;
  onClose: () => void;
}

export const useUpsertIncident = ({
  onClose,
  incidentId,
}: UseUpsertIncidentProps) => {
  const { workspace } = useWorkspace();

  const navigate = useNavigate();
  const isEditing = !!incidentId;

  const form = useForm<IncidentForm>({
    initialValues: {
      incidentId,
      workspaceId: workspace.id,
      teamId: "",
      leaderId: "",
      detectedAt: "",
      resolvedAt: null,
      causeDeploymentId: "",
      fixDeploymentId: null,
      postmortemUrl: "",
    },
    validate: zodResolver(IncidentForm),
  });

  const { mutate, isPending } = useUpsertIncidentMutation({
    onSuccess: () => {
      const message = isEditing ? "Incident updated" : "New incident created";
      showSuccessNotification({ message });

      onClose();
      navigate(`/systems/incidents`);
    },
    onError: () => {
      showErrorNotification({
        message: "Something went wrong. Please try again.",
      });
    },
  });

  const isFormValid = useMemo(() => form.isValid(), [form]);

  const handleSave: FormEventHandler = async (event) => {
    event.preventDefault();

    if (form.validate().hasErrors) return;

    await mutate({
      input: {
        ...form.values,
        teamId: form.values.teamId || null,
        leaderId: form.values.leaderId || null,
        detectedAt: new UTCDate(form.values.detectedAt).toISOString(),
        resolvedAt: form.values.resolvedAt
          ? new UTCDate(form.values.resolvedAt).toISOString()
          : null,
        fixDeploymentId: form.values.fixDeploymentId || null,
        postmortemUrl: form.values.postmortemUrl || null,
      },
    });
  };

  return {
    form,
    isPending,
    isFormValid,
    handleSave,
  };
};
