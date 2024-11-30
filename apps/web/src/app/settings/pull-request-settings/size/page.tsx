import {
  Text,
  Title,
  Button,
  Stack,
  Group,
  NumberInput,
  Divider,
  TagsInput,
} from "@mantine/core";
import { DrawerScrollable } from "../../../../components/drawer-scrollable";
import { useDrawerPage } from "../../../../providers/drawer-page.provider";
import { BadgePullRequestSize } from "../../../../components/badge-pull-request-size";
import { PullRequestSize } from "@sweetr/graphql-types/frontend/graphql";

export const PullRequestSizePage = () => {
  const drawerProps = useDrawerPage({
    closeUrl: `/settings/pull-request`,
  });

  return (
    <DrawerScrollable
      {...drawerProps}
      title="Pull Request Size"
      actions={
        <>
          <Button type="submit" loading={false}>
            Save
          </Button>
        </>
      }
      size={580}
    >
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
            <NumberInput defaultValue={100} flex="1" />
            changes.
          </Group>
        ))}
        <Group>
          <BadgePullRequestSize size={PullRequestSize.HUGE} />
          <Text>more than 100 changes</Text>
        </Group>
      </Stack>
      <Divider my="sm" />
      <Stack p="md">
        <Title order={5}>Ignore Files</Title>
        <TagsInput
          label="Glob Patterns"
          description="Files matching these patterns will be ignored when calculating total changes."
          value={["package-lock.json", "yarn.lock"]}
        />
        <Text c="dimmed" fz="sm"></Text>
      </Stack>
    </DrawerScrollable>
  );
};
