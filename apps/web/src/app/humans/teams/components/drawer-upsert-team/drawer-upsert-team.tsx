import { Button } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { Team } from "@sweetr/graphql-types/frontend/graphql";
import { FC, FormEventHandler, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUpsertTeamMutation } from "../../../../../api/teams.api";
import { DrawerScrollable } from "../../../../../components/drawer-scrollable/drawer-scrollable";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../../../../providers/notification.provider";
import { FormUpsertTeam } from "./form-upsert-team";
import { TeamForm } from "./types";
import { useWorkspace } from "../../../../../providers/workspace.provider";

interface DrawerUpsertTeamProps {
  isOpen: boolean;
  onClose: () => void;
  team?: Team;
}

export const DrawerUpsertTeam: FC<DrawerUpsertTeamProps> = ({
  isOpen,
  onClose,
  team,
}) => {
  const { workspace } = useWorkspace();

  const navigate = useNavigate();
  const form = useForm<TeamForm>({
    initialValues: {
      teamId: team?.id,
      workspaceId: workspace.id,
      name: team?.name || "",
      description: team?.description || "",
      startColor: team?.startColor || "",
      endColor: team?.endColor || "",
      icon: team?.icon || "⚡",
      members: team?.members || [],
    },
    validate: zodResolver(TeamForm),
  });
  const { mutate, isPending } = useUpsertTeamMutation({
    onSuccess: (team) => {
      const message = isEditing ? "Team updated." : "New team created.";
      showSuccessNotification({ message });

      onClose();
      navigate(`/humans/teams/${team.upsertTeam.id}`);
    },
    onError: () => {
      showErrorNotification({
        message: "Something went wrong. Please try again.",
      });
    },
  });

  const isEditing = !!team;
  const title = isEditing ? "Edit team" : "Create team";
  const action = isEditing ? "Update team" : "Create new team";
  const isFormValid = useMemo(() => form.isValid(), [form]);

  const handleSave: FormEventHandler = async (event) => {
    event.preventDefault();

    if (form.validate().hasErrors) return;

    await mutate({
      input: {
        ...form.values,
        members: form.values.members.map((member) => ({
          personId: member.person.id,
          role: member.role,
        })),
      },
    });
  };

  return (
    <>
      <DrawerScrollable
        position="right"
        opened={isOpen}
        onClose={onClose || (() => {})}
        size="xl"
        title={title}
        actions={
          <Button type="submit" disabled={!isFormValid} loading={isPending}>
            {action}
          </Button>
        }
        onSubmit={handleSave}
      >
        <FormUpsertTeam form={form} />
      </DrawerScrollable>
    </>
  );
};
