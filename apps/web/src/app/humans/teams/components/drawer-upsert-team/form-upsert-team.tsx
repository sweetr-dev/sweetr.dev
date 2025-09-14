import {
  Stack,
  Title,
  TextInput,
  Divider,
  Group,
  Popover,
  ActionIcon,
  ColorInput,
  Text,
  Avatar,
  Paper,
  Button,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useEffect } from "react";
import { EmojiPicker } from "../../../../../components/emoji-picker";
import { colorPickerSwatches } from "../../../../../providers/color.provider";
import { PersonData, TeamForm } from "./types";
import classes from "./form-upsert-team.module.css";
import { IconTrash } from "@tabler/icons-react";
import { InputSelectPerson } from "./input-select-person";
import { InputSelectRole } from "./input-select-role";
import { TeamMemberRole } from "@sweetr/graphql-types/frontend/graphql";
import { AvatarUser } from "../../../../../components/avatar-user";

export interface FormUpsertTeamProps {
  form: UseFormReturnType<TeamForm>;
}

export const FormUpsertTeam = ({ form }: FormUpsertTeamProps) => {
  const startColor = form.values.startColor;
  const endColor = form.values.endColor;

  useEffect(() => {
    if (!endColor || startColor === endColor) {
      form.setFieldValue("endColor", startColor);
    }
  }, [startColor, endColor, form]);

  const teamMembers = form.values.members;

  const handleAddPerson = (person: PersonData) => {
    form.insertListItem("members", { person, role: TeamMemberRole.ENGINEER });
  };

  const handleRemovePerson = (index: number) => {
    form.removeListItem("members", index);
  };

  return (
    <>
      <Stack p="md">
        <Title order={5}>Details</Title>
        <TextInput
          placeholder="Super squad"
          label="Team name"
          withAsterisk
          data-autofocus
          {...form.getInputProps("name")}
        />
        <TextInput
          placeholder="We use our super powers to create awesome products"
          label="Description"
          {...form.getInputProps("description")}
        />
      </Stack>

      <Divider my="sm" />

      <Stack p="md" className={classes.previewGradient}>
        <Title order={5}>Customize</Title>

        <Group style={{ flexWrap: "nowrap" }} align="end">
          <div>
            <Popover position="bottom-start" shadow="md">
              <Popover.Target>
                <ActionIcon size={54} variant="default">
                  <Text lh={1} fz={32}>
                    {form.values.icon}
                  </Text>
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown p={0}>
                <EmojiPicker
                  onChange={(icon) => {
                    form.setValues({ icon });
                  }}
                />
              </Popover.Dropdown>
            </Popover>
          </div>
          <ColorInput
            placeholder="#F0F0F0"
            label="Start color"
            swatches={colorPickerSwatches}
            withAsterisk
            swatchesPerRow={7}
            {...form.getInputProps("startColor")}
            style={{ flexGrow: 1 }}
          />
          <ColorInput
            placeholder="#EEEEEE"
            label="End Color"
            swatches={colorPickerSwatches}
            withAsterisk
            swatchesPerRow={7}
            {...form.getInputProps("endColor")}
            style={{ flexGrow: 1 }}
          />
        </Group>
      </Stack>

      <Divider my="sm" />

      <Stack p="md">
        <Title order={5}>Members</Title>

        <Group gap="xs" justify="space-between">
          <InputSelectPerson
            onSubmit={handleAddPerson}
            hidePeople={teamMembers.map((member) => member.person.id)}
          />
        </Group>

        <Stack gap="xs">
          {teamMembers.map((member, index) => {
            const roleInputProps = form.getInputProps(`members.${index}.role`);

            return (
              <Paper withBorder p="sm" key={member.id} radius="sm">
                <Group justify="space-between">
                  <Group style={{ flexGrow: 1 }}>
                    <AvatarUser
                      name={member.person.name || ""}
                      size="md"
                      src={member.person.avatar}
                    />
                    {member.person.name || member.person.handle}
                  </Group>
                  <InputSelectRole {...roleInputProps} />
                  <Button
                    variant="subtle"
                    color="red"
                    leftSection={<IconTrash stroke={1.5} size={16} />}
                    onClick={() => handleRemovePerson(index)}
                  >
                    Remove
                  </Button>
                </Group>
              </Paper>
            );
          })}
        </Stack>
      </Stack>
    </>
  );
};
