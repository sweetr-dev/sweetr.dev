import {
  Text,
  Title,
  Button,
  Stack,
  Group,
  NumberInput,
  Divider,
  TagsInput,
  Anchor,
} from "@mantine/core";
import { DrawerScrollable } from "../../../../components/drawer-scrollable";
import { useDrawerPage } from "../../../../providers/drawer-page.provider";
import { BadgePullRequestSize } from "../../../../components/badge-pull-request-size";
import { PullRequestSize } from "@sweetr/graphql-types/frontend/graphql";
import { useSupportChat } from "../../../../components/navbar/use-support-chat";

export const PullRequestSizePage = () => {
  const drawerProps = useDrawerPage({
    closeUrl: `/settings/pull-request`,
  });
  const { openChat } = useSupportChat();

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
    </DrawerScrollable>
  );
};
