import { UseFormReturnType } from "@mantine/form";
import { PullRequestSizeSettings } from "./types";
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
import { BadgePullRequestSize } from "../../../../../components/badge-pull-request-size";
import { PullRequestSize } from "@sweetr/graphql-types/frontend/graphql";
import { useSupportChat } from "../../../../../components/navbar/use-support-chat";

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
              defaultValue={100}
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
          value={["package-lock.json", "yarn.lock"]}
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
