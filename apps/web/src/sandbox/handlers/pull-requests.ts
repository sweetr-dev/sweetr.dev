import { graphql, HttpResponse } from "msw";
import { parseISO } from "date-fns";
import type { DateTimeRange } from "@sweetr/graphql-types/frontend/graphql";
import {
  PullRequestSize,
  PullRequestState,
} from "@sweetr/graphql-types/frontend/graphql";
import { pullRequestsFixture } from "../fixtures/pull-requests";

function timestampInRange(iso: string, range?: DateTimeRange | null): boolean {
  if (!range?.from && !range?.to) {
    return true;
  }
  const t = parseISO(iso).getTime();
  if (range.from != null && t < parseISO(range.from).getTime()) {
    return false;
  }
  if (range.to != null && t > parseISO(range.to).getTime()) {
    return false;
  }
  return true;
}

export const pullRequestsHandlers = [
  graphql.query("PullRequests", ({ variables }) => {
    const input = (variables?.input ?? {}) as {
      states?: PullRequestState[];
      ownerIds?: string[];
      cursor?: string;
      sizes?: PullRequestSize[];
      createdAt?: DateTimeRange | null;
      completedAt?: DateTimeRange | null;
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

    if (input.sizes?.length) {
      filtered = filtered.filter((pr) =>
        input.sizes!.includes(pr.tracking.size),
      );
    }

    if (input.createdAt?.from != null || input.createdAt?.to != null) {
      filtered = filtered.filter((pr) =>
        timestampInRange(pr.createdAt, input.createdAt),
      );
    }

    if (input.completedAt?.from != null || input.completedAt?.to != null) {
      filtered = filtered.filter((pr) => {
        const end = pr.mergedAt ?? pr.closedAt;
        if (!end) {
          return false;
        }
        return timestampInRange(end, input.completedAt);
      });
    }

    if (input.cursor) {
      const cursorIndex = filtered.findIndex((pr) => pr.id === input.cursor);
      if (cursorIndex < 0) {
        filtered = [];
      } else {
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
