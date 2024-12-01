import { UseFormReturnType } from "@mantine/form";
import {
  Stack,
  Title,
  Group,
  NumberInput,
  Divider,
  TagsInput,
  Button,
  Text,
} from "@mantine/core";
import { PullRequestSize } from "@sweetr/graphql-types/frontend/graphql";
import { BadgePullRequestSize } from "../../../../../../components/badge-pull-request-size";
import { useSupportChat } from "../../../../../../components/navbar/use-support-chat";
import { PullRequestSizeSettings } from "./types";

export interface FormPullRequestSizeSettingsProps {
  form: UseFormReturnType<PullRequestSizeSettings>;
}

export const FormPullRequestSizeSettings = ({
  form,
}: FormPullRequestSizeSettingsProps) => {
  const { openChat } = useSupportChat();

  return (
    <>
      <Stack p="md">
        <Title order={5}>Sizing</Title>

        {[
          PullRequestSize.TINY,
          PullRequestSize.SMALL,
          PullRequestSize.MEDIUM,
          PullRequestSize.LARGE,
        ].map((size) => (
          <Group key={size}>
            <BadgePullRequestSize size={size} />
            <Text>up to</Text>
            <NumberInput
              flex="1"
              {...form.getInputProps(
                `settings.pullRequest.size.${size.toLowerCase()}`,
              )}
            />
            changes.
          </Group>
        ))}
        <Group>
          <BadgePullRequestSize size={PullRequestSize.HUGE} />
          <Text>
            more than {form.getValues().settings?.pullRequest?.size?.large}{" "}
            changes.
          </Text>
        </Group>
      </Stack>
      <Divider my="sm" />
      <Stack p="md">
        <Title order={5}>Ignore Files</Title>
        <TagsInput
          label="Glob Patterns"
          description="Files matching these patterns will be ignored when calculating total changes."
          {...form.getInputProps(`settings.pullRequest.size.ignorePatterns`)}
        />
      </Stack>
      <Divider my="sm" />
      <Stack p="md">
        <Title order={5}>Note</Title>
        <Text c="dimmed" fz="sm">
          We recalculate the Pull Request size every time it receives an update.{" "}
          Reach out to support if you need all past stale Pull Requests
          recalculated.
        </Text>
        <Button onClick={openChat} variant="default" w="fit-content">
          Chat with support
        </Button>
      </Stack>
    </>
  );
};
