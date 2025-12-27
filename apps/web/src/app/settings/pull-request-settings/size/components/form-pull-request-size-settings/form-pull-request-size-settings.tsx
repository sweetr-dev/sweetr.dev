import {
  Anchor,
  Divider,
  Group,
  NumberInput,
  Stack,
  TagsInput,
  Text,
  Title,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { PullRequestSize } from "@sweetr/graphql-types/frontend/graphql";
import { Link } from "react-router-dom";
import { BadgePullRequestSize } from "../../../../../../components/badge-pull-request-size";
import { PullRequestSizeSettings } from "./types";

export interface FormPullRequestSizeSettingsProps {
  form: UseFormReturnType<PullRequestSizeSettings>;
}

export const FormPullRequestSizeSettings = ({
  form,
}: FormPullRequestSizeSettingsProps) => {
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
        <Stack gap={5}>
          <Text c="dimmed" fz="sm">
            We recalculate the Pull Request size every time it receives an
            update.
          </Text>
          <Text c="dimmed" fz="sm">
            You can fully resync historical data from your{" "}
            <Anchor
              component={Link}
              to="/settings/workspace/resync"
              target="_blank"
              fz="sm"
            >
              workspace settings
            </Anchor>
            .
          </Text>
        </Stack>
      </Stack>
    </>
  );
};
