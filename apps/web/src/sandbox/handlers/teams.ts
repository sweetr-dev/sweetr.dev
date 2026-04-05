import { graphql, HttpResponse } from "msw";
import { PullRequestState } from "@sweetr/graphql-types/frontend/graphql";
import { teamsFixture, teamFixture, TEAMS } from "../fixtures/teams";
import { pullRequestsFixture } from "../fixtures/pull-requests";

export const teamsHandlers = [
  graphql.query("Teams", () => {
    return HttpResponse.json({ data: teamsFixture });
  }),

  graphql.query("Team", ({ variables }) => {
    return HttpResponse.json({
      data: teamFixture(variables.teamId as string),
    });
  }),

  graphql.query("TeamOptions", () => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          teams: TEAMS.map((t) => ({
            __typename: "Team",
            id: t.id,
            name: t.name,
            icon: t.icon,
          })),
        },
      },
    });
  }),

  graphql.query("TeamPullRequestsInProgress", ({ variables }) => {
    const team = TEAMS.find((t) => t.id === variables.teamId) ?? TEAMS[0];
    const memberIds = team.members.map((m) => m.person.id);
    const teamPRs = pullRequestsFixture.filter((pr) =>
      memberIds.includes(pr.author.id),
    );

    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          id: "1",
          team: {
            __typename: "Team",
            id: team.id,
            pullRequestsInProgress: {
              __typename: "PullRequestsInProgressResponse",
              drafted: teamPRs.filter(
                (pr) => pr.state === PullRequestState.DRAFT,
              ),
              pendingReview: teamPRs.filter(
                (pr) => pr.state === PullRequestState.OPEN,
              ),
              changesRequested: [],
              pendingMerge: [],
            },
          },
        },
      },
    });
  }),
];
