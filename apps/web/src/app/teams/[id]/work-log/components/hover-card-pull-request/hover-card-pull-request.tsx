import {
  Anchor,
  Group,
  HoverCard,
  HoverCardProps,
  Stack,
  Text,
} from "@mantine/core";
import { PullRequest } from "@sweetr/graphql-types/frontend/graphql";
import { IconPullRequestState } from "../../../../../../components/icon-pull-request-state";
import { BadgePullRequestSize } from "../../../../../../components/badge-pull-request-size";
import { LinesChanged } from "../../../../../../components/lines-changed/lines-changed";
import { getPullRequestChanges } from "../../../../../../providers/pull-request.provider";
import { IconBrandGithub, IconClock } from "@tabler/icons-react";
import { format } from "date-fns";

interface HoverCardPullRequestProps extends HoverCardProps {
  target: React.ReactNode;
  eventAt: Date;
  pullRequest: PullRequest;
  children?: React.ReactNode;
}

export const HoverCardPullRequest = ({
  target,
  pullRequest,
  eventAt,
  children,
  ...props
}: HoverCardPullRequestProps) => {
  return (
    <HoverCard {...props} transitionProps={{ duration: 0 }} withArrow>
      <HoverCard.Target>{target}</HoverCard.Target>
      <HoverCard.Dropdown bg="dark.7">
        <Stack gap="xs">
          <Group align="center">
            <Group gap={5} align="center">
              <IconPullRequestState state={pullRequest.state} />
              <Anchor href={pullRequest.gitUrl} target="_blank" c="dark.0">
                <Text fw={500}>{pullRequest.title}</Text>
              </Anchor>
            </Group>
            <BadgePullRequestSize
              size={pullRequest.tracking.size}
              tooltip={<LinesChanged {...getPullRequestChanges(pullRequest)} />}
            />
          </Group>
          <Group justify="space-between">
            <Group gap={5}>
              <IconBrandGithub stroke={1.5} size={20} />
              <Anchor
                href={`https://github.com/${pullRequest.repository.fullName}`}
                target="_blank"
                c="dark.0"
              >
                <Text>{pullRequest.repository.fullName}</Text>
              </Anchor>
            </Group>
          </Group>
          {children}

          <Group justify="space-between">
            <Group gap={5}>
              <IconClock stroke={1.5} size={20} />
              <Text>{format(eventAt, "MMM d, HH:mm")}</Text>
            </Group>
          </Group>
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
};
