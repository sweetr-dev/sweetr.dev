import { CodeReviewState, PullRequestState } from "@prisma/client";
import { getPrisma, take } from "../../../prisma";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import {
  getWorkspaceSlackClient,
  joinSlackChannel,
  sendSlackMessage,
} from "../../integrations/slack/services/slack-client.service";
import { DigestWithWorkspace } from "./digest.types";
import { AnyBlock } from "@slack/web-api";
import { getPersonGitUrl } from "../../people/services/people.service";
import { env } from "../../../env";
import { encodeId } from "../../../lib/hash-id";
import { capitalize } from "radash";
import { subMonths } from "date-fns/subMonths";

export const sendTeamWipDigest = async (digest: DigestWithWorkspace) => {
  const { slackClient } = await getWorkspaceSlackClient(digest.workspaceId);

  const slackChannel = await joinSlackChannel(slackClient, digest.channel);

  if (!slackChannel?.id) {
    throw new ResourceNotFoundException("Slack channel not found");
  }

  const blocks = await getDigestMessageBlocks(digest);

  await sendSlackMessage(slackClient, {
    channel: slackChannel.id,
    blocks,
    unfurl_links: false,
    unfurl_media: false,
  });
};

const getDigestMessageBlocks = async (
  digest: DigestWithWorkspace
): Promise<AnyBlock[]> => {
  const { drafted, open, approved } = await getPullRequestsGroupedByState(
    digest.workspaceId,
    digest.teamId
  );

  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Work In Progress Digest",
      },
    },
    {
      type: "section",
      text: {
        type: "plain_text",
        text: "Summary of the team's open pull requests.",
      },
    },
    {
      type: "divider",
    },
    ...getPullRequestSectionBlock("🚧 Drafted:", drafted),
    ...getPullRequestSectionBlock("⏳ Awaiting Review:", open),
    ...getPullRequestSectionBlock("🚀 Awaiting Merge:", approved),
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Manage Digest",
          },
          url: `${env.FRONTEND_URL}/teams/${encodeId(digest.teamId)}/digests/wip`,
        },
      ],
    },
  ];
};

const getPullRequestSectionBlock = (
  header: string,
  pullRequests: Awaited<
    ReturnType<typeof getPullRequestsGroupedByState>
  >[keyof Awaited<ReturnType<typeof getPullRequestsGroupedByState>>]
) => {
  if (!pullRequests.length) {
    return [];
  }

  const limit = 10;
  const hasMoreThanLimit = pullRequests.length > limit;

  return [
    {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            {
              type: "text",
              text: header,
              style: { bold: true },
            },
          ],
        },
        {
          type: "rich_text_list",
          elements: [
            ...pullRequests.slice(0, limit - 1).map((pullRequest) => ({
              type: "rich_text_section",
              elements: [
                ...(pullRequest.tracking?.size
                  ? [
                      {
                        type: "text",
                        text: capitalize(pullRequest.tracking?.size),
                        style: { code: true },
                      },
                    ]
                  : []),
                {
                  type: "link",
                  text: ` ${pullRequest.title}`,
                  url: pullRequest.gitUrl,
                },
                {
                  type: "text",
                  text: " | ",
                },
                {
                  type: "link",
                  text: `@${pullRequest.author.name}`,
                  url: getPersonGitUrl(pullRequest.author),
                },
              ],
            })),
            ...(hasMoreThanLimit
              ? [
                  {
                    type: "rich_text_section",
                    elements: [
                      {
                        type: "text",
                        text: `${pullRequests.length - limit} more...`,
                      },
                    ],
                  },
                ]
              : []),
          ],
          style: "bullet",
          indent: 1,
        },
      ],
    },
    {
      type: "divider",
    },
  ];
};

const getPullRequestsGroupedByState = async (
  workspaceId: number,
  teamId: number
) => {
  const pullRequests = await getPrisma(workspaceId).pullRequest.findMany({
    where: {
      author: {
        teamMemberships: {
          some: {
            teamId,
          },
        },
      },
      mergedAt: null,
      createdAt: {
        gte: subMonths(new Date(), 3),
      },
    },
    take: take(100),
    include: {
      codeReviews: true,
      author: true,
      tracking: true,
    },
  });

  const drafted: typeof pullRequests = [];
  const open: typeof pullRequests = [];
  const approved: typeof pullRequests = [];

  for (const pullRequest of pullRequests) {
    if (pullRequest.state === PullRequestState.DRAFT) {
      drafted.push(pullRequest);
      continue;
    }

    if (
      pullRequest.codeReviews.some(
        (review) => review.state === CodeReviewState.APPROVED
      )
    ) {
      approved.push(pullRequest);
      continue;
    }

    open.push(pullRequest);
  }

  return { drafted, open, approved };
};
