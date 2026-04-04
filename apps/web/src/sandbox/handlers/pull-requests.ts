import { graphql, HttpResponse } from "msw";
import {
  PullRequestState,
} from "@sweetr/graphql-types/frontend/graphql";
import { pullRequestsFixture } from "../fixtures/pull-requests";

export const pullRequestsHandlers = [
  graphql.query("PullRequests", ({ variables }) => {
    const input = variables.input as {
      states?: PullRequestState[];
      ownerIds?: string[];
      cursor?: string;
    };

    let filtered = [...pullRequestsFixture];

    if (input.states?.length) {
      filtered = filtered.filter((pr) => input.states!.includes(pr.state));
    }

    if (input.ownerIds?.length) {
      filtered = filtered.filter((pr) =>
        input.ownerIds!.includes(pr.author.id),
      );
    }

    if (input.cursor) {
      const cursorIndex = filtered.findIndex((pr) => pr.id === input.cursor);
      if (cursorIndex >= 0) {
        filtered = filtered.slice(cursorIndex + 1);
      }
    }

    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          pullRequests: filtered,
        },
      },
    });
  }),
];
