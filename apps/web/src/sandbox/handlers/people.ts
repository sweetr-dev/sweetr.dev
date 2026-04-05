import { graphql, HttpResponse } from "msw";
import {
  CodeReviewState,
  PullRequestSize,
  PullRequestState,
} from "@sweetr/graphql-types/frontend/graphql";
import { subDays } from "date-fns";
import { peopleFixture, personFixture, PEOPLE } from "../fixtures/people";
import { pullRequestsFixture } from "../fixtures/pull-requests";

export const peopleHandlers = [
  graphql.query("People", ({ variables }) => {
    const input = (variables.input ?? {}) as { cursor?: string };

    if (input.cursor) {
      return HttpResponse.json({
        data: {
          workspace: {
            __typename: "Workspace",
            people: [],
          },
        },
      });
    }

    return HttpResponse.json({ data: peopleFixture });
  }),

  graphql.query("Person", ({ variables }) => {
    return HttpResponse.json({
      data: personFixture(variables.handle as string),
    });
  }),

  graphql.query("PersonCodeReviews", ({ variables }) => {
    const input = (variables.input ?? {}) as { cursor?: string };
    if (input.cursor) {
      return HttpResponse.json({
        data: {
          workspace: {
            __typename: "Workspace",
            person: { __typename: "Person", codeReviews: [] },
          },
        },
      });
    }

    const person =
      PEOPLE.find((p) => p.handle === variables.handle) ?? PEOPLE[0];
    const otherPeople = PEOPLE.filter((p) => p.id !== person.id);

    const codeReviews = pullRequestsFixture
      .filter((pr) => pr.state === PullRequestState.MERGED)
      .slice(0, 5)
      .map((pr, i) => {
        const authorPerson =
          otherPeople.length > 0 ? otherPeople[i % otherPeople.length] : person;
        return {
          __typename: "CodeReview" as const,
          id: `cr-${person.id}-${i}`,
          state:
            i % 3 === 0
              ? CodeReviewState.CHANGES_REQUESTED
              : CodeReviewState.APPROVED,
          commentCount: i + 1,
          createdAt: subDays(new Date(), i * 3 + 1).toISOString(),
          author: {
            __typename: "Person" as const,
            id: person.id,
            name: person.name,
            handle: person.handle,
            avatar: person.avatar,
          },
          pullRequest: {
            __typename: "PullRequest" as const,
            id: pr.id,
            title: pr.title,
            gitUrl: pr.gitUrl,
            commentCount: pr.commentCount,
            changedFilesCount: pr.changedFilesCount,
            linesAddedCount: pr.linesAddedCount,
            linesDeletedCount: pr.linesDeletedCount,
            tracking: {
              __typename: "PullRequestTracking" as const,
              size: pr.tracking.size as PullRequestSize,
              changedFilesCount: pr.tracking.changedFilesCount,
              linesAddedCount: pr.tracking.linesAddedCount,
              linesDeletedCount: pr.tracking.linesDeletedCount,
              firstReviewAt: pr.tracking.firstReviewAt,
              timeToFirstReview: pr.tracking.timeToFirstReview,
            },
            author: {
              __typename: "Person" as const,
              id: authorPerson.id,
              name: authorPerson.name,
              handle: authorPerson.handle,
              avatar: authorPerson.avatar,
            },
            repository: pr.repository,
          },
        };
      });

    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          person: {
            __typename: "Person",
            codeReviews,
          },
        },
      },
    });
  }),
];
