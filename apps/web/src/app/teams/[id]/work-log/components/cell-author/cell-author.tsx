import { Avatar, Badge, Group, Stack, Text } from "@mantine/core";
import { teamRoleColorMap } from "../../../../../../providers/team-role.provider";
import { ActivityEvent } from "@sweetr/graphql-types/frontend/graphql";
import { TeamMemberRole } from "@sweetr/graphql-types/frontend/graphql";
import { IconCodeReview } from "../icon-code-review";
import { IconMergedPR } from "../icon-merged-pr";
import { IconOpenedPR } from "../icon-opened-pr";

interface CellAuthorProps {
  author: {
    name: string;
    avatar?: string | null;
    handle: string;
    role: TeamMemberRole;
    events: ActivityEvent[][];
    totals: Record<NonNullable<ActivityEvent["__typename"]>, number>;
  };
}

export const CellAuthor = ({ author }: CellAuthorProps) => {
  return (
    <>
      <Stack gap={5} align="center" justify="center" style={{ flexGrow: 1 }}>
        <Avatar src={author.avatar} size={48} />

        <Text lineClamp={1} title={author.name}>
          {author.name}
        </Text>

        <Badge variant="light" size="sm" color={teamRoleColorMap[author.role]}>
          {author.role}
        </Badge>
      </Stack>
      <Group gap="xs" justify="center" mt="sm">
        <Group gap={5} align="center" wrap="nowrap">
          <IconCodeReview size={16} />
          {author.totals.CodeReviewSubmittedEvent.toString()}
        </Group>
        <Group gap={5} align="center" wrap="nowrap">
          <IconOpenedPR size={16} />
          {author.totals.PullRequestCreatedEvent.toString()}
        </Group>
        <Group gap={5} align="center" wrap="nowrap">
          <IconMergedPR size={16} />
          {author.totals.PullRequestMergedEvent.toString()}
        </Group>
      </Group>
    </>
  );
};
