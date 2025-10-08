import { Stack, Group, Text, Anchor } from "@mantine/core";
import {
  ActivityEvent,
  CodeReviewState,
  CodeReviewSubmittedEvent,
  PullRequestCreatedEvent,
  PullRequestMergedEvent,
  PullRequestSize,
} from "@sweetr/graphql-types/frontend/graphql";
import {
  IconCheck,
  IconHexagonFilled,
  IconMessageExclamation,
  IconMessageFilled,
  IconPencil,
} from "@tabler/icons-react";
import { group } from "radash";
import { HoverCardPullRequest } from "../hover-card-pull-request";
import { IconCodeReview } from "../icon-code-review";
import { IconOpenedPR } from "../icon-opened-pr";
import { IconMergedPR } from "../icon-merged-pr";
import { parseISO } from "date-fns";

interface GitActivityProps {
  events: ActivityEvent[];
}

export const GitActivity = ({ events }: GitActivityProps) => {
  const groupedEvents = group(events, (event) => event.__typename!);

  const sizes: Record<PullRequestSize, number> = {
    [PullRequestSize.TINY]: 12,
    [PullRequestSize.SMALL]: 16,
    [PullRequestSize.MEDIUM]: 24,
    [PullRequestSize.LARGE]: 30,
    [PullRequestSize.HUGE]: 40,
  };

  return (
    <Stack gap="xs">
      <Group gap={5} wrap="nowrap" mih={sizes[PullRequestSize.HUGE]}>
        {groupedEvents.CodeReviewSubmittedEvent?.map((event, index) => {
          const codeReview = (event as CodeReviewSubmittedEvent).codeReview;

          return (
            <HoverCardPullRequest
              key={index}
              pullRequest={codeReview.pullRequest}
              eventAt={parseISO(event.eventAt)}
              target={
                <Anchor href={codeReview.pullRequest.gitUrl} target="_blank">
                  <IconCodeReview
                    size={sizes[codeReview.pullRequest.tracking.size]}
                  />
                </Anchor>
              }
            >
              <Group gap={5}>
                {codeReview.state === CodeReviewState.APPROVED && (
                  <IconCheck
                    stroke={1.5}
                    size={20}
                    color="var(--mantine-color-green-4)"
                  />
                )}
                {codeReview.state === CodeReviewState.COMMENTED && (
                  <IconPencil stroke={1.5} size={20} color="white" />
                )}
                {codeReview.state === CodeReviewState.CHANGES_REQUESTED && (
                  <IconMessageExclamation
                    stroke={1.5}
                    size={20}
                    color="var(--mantine-color-red-4)"
                  />
                )}

                <Group gap={5}>
                  <Text>
                    {codeReview.state === CodeReviewState.APPROVED &&
                      "Approved"}
                    {codeReview.state === CodeReviewState.COMMENTED &&
                      "Reviewed"}
                    {codeReview.state === CodeReviewState.CHANGES_REQUESTED &&
                      "Requested changes"}
                  </Text>
                  <Text>•</Text>
                  <Text>{codeReview.commentCount} comments</Text>
                </Group>
              </Group>
            </HoverCardPullRequest>
          );
        })}
      </Group>
      <Group gap={5} wrap="nowrap" mih={sizes[PullRequestSize.HUGE]}>
        {groupedEvents.PullRequestCreatedEvent?.map((event, index) => {
          const pullRequest = (event as PullRequestCreatedEvent).pullRequest;
          return (
            <HoverCardPullRequest
              key={index}
              eventAt={parseISO(event.eventAt)}
              pullRequest={pullRequest}
              target={
                <Anchor href={pullRequest.gitUrl} target="_blank">
                  <IconOpenedPR size={sizes[pullRequest.tracking.size]} />
                </Anchor>
              }
            />
          );
        })}
      </Group>
      <Group gap={5} wrap="nowrap" mih={sizes[PullRequestSize.HUGE]}>
        {groupedEvents.PullRequestMergedEvent?.map((event, index) => {
          const pullRequest = (event as PullRequestMergedEvent).pullRequest;
          return (
            <HoverCardPullRequest
              key={index}
              eventAt={parseISO(event.eventAt)}
              pullRequest={pullRequest}
              target={
                <Anchor href={pullRequest.gitUrl} target="_blank">
                  <IconMergedPR size={sizes[pullRequest.tracking.size]} />
                </Anchor>
              }
            />
          );
        })}
      </Group>
    </Stack>
  );
};
