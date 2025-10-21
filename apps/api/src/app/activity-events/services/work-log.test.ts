import { describe, it, expect } from "vitest";
import {
  groupSerialReviews,
  REVIEW_GROUPING_WINDOW_MINS,
} from "./work-log.service";
import { ActivityEventType, PullRequestState } from "@prisma/client";
import { addMinutes, addSeconds } from "date-fns";
import { CodeReviewState } from "../../../graphql-types";
import {
  ActivityEventData,
  CodeReviewActivityEvent,
  PullRequestActivityEvent,
  isCodeReviewActivityEvent,
} from "../services/activity-events.types";

type CreateCodeReviewEventArgs = {
  eventAt: Date;
  codeReview: Partial<CodeReviewActivityEvent["codeReview"]> & {
    pullRequestId: number;
    authorId: number;
  };
};

type CreatePullRequestEventArgs = {
  type: "PULL_REQUEST_CREATED" | "PULL_REQUEST_MERGED";
  eventAt: Date;
  pullRequest: Partial<PullRequestActivityEvent["pullRequest"]> & {
    id: number;
  };
};

const John = 1;
const Jack = 2;

describe("groupSerialReviews", () => {
  const createCodeReviewEvent = ({
    eventAt,
    codeReview,
  }: CreateCodeReviewEventArgs): CodeReviewActivityEvent => ({
    type: ActivityEventType.CODE_REVIEW_SUBMITTED,
    eventAt,
    codeReview: {
      id: 1,
      state: CodeReviewState.APPROVED,
      commentCount: 0,
      createdAt: eventAt,
      workspaceId: 1,
      updatedAt: eventAt,
      ...codeReview,
    },
  });

  const createPullRequestEvent = ({
    type,
    eventAt,
    pullRequest,
  }: CreatePullRequestEventArgs): PullRequestActivityEvent => ({
    type,
    eventAt,
    pullRequest: {
      mergeCommitSha: null,
      gitProvider: "GITHUB",
      gitPullRequestId: "1",
      gitUrl: "https://github.com/test/test/pull/1",
      title: "Test PR",
      number: "1",
      files: [],
      commentCount: 0,
      changedFilesCount: 0,
      linesAddedCount: 0,
      linesDeletedCount: 0,
      state: PullRequestState.OPEN,
      createdAt: eventAt,
      updatedAt: eventAt,
      mergedAt: null,
      closedAt: null,
      authorId: John,
      repositoryId: 1,
      workspaceId: 1,
      ...pullRequest,
    },
  });

  describe("should group", () => {
    it(`code reviews within ${REVIEW_GROUPING_WINDOW_MINS} minutes for same PR and author`, () => {
      const baseDate = new Date("2024-01-01T00:00:00Z");
      const events: ActivityEventData[] = [
        createCodeReviewEvent({
          eventAt: baseDate,
          codeReview: {
            pullRequestId: 1,
            authorId: John,
            commentCount: 2,
          },
        }),
        createCodeReviewEvent({
          eventAt: addMinutes(baseDate, 15),
          codeReview: {
            pullRequestId: 1,
            authorId: John,
            commentCount: 3,
          },
        }),
      ];

      const result = groupSerialReviews(events);
      expect(result).toHaveLength(1);
      expect(isCodeReviewActivityEvent(result[0])).toBe(true);
      if (isCodeReviewActivityEvent(result[0])) {
        expect(result[0].codeReview.commentCount).toBe(5);
      }
    });

    it(`reviews that are within ${REVIEW_GROUPING_WINDOW_MINS} minutes of the first review in a session`, () => {
      const baseDate = new Date("2024-01-01T00:00:00Z");
      const events: ActivityEventData[] = [
        createCodeReviewEvent({
          eventAt: baseDate,
          codeReview: {
            pullRequestId: 1,
            authorId: John,
            commentCount: 2,
          },
        }),
        createCodeReviewEvent({
          eventAt: addMinutes(baseDate, 15),
          codeReview: {
            pullRequestId: 1,
            authorId: John,
            commentCount: 3,
          },
        }),
        createCodeReviewEvent({
          eventAt: addMinutes(baseDate, REVIEW_GROUPING_WINDOW_MINS),
          codeReview: {
            pullRequestId: 1,
            authorId: John,
            commentCount: 3,
          },
        }),
        createCodeReviewEvent({
          eventAt: addMinutes(baseDate, REVIEW_GROUPING_WINDOW_MINS + 5),
          codeReview: {
            pullRequestId: 1,
            authorId: John,
            commentCount: 1,
          },
        }),
      ];

      const result = groupSerialReviews(events);
      expect(result).toHaveLength(2);
      expect(isCodeReviewActivityEvent(result[0])).toBe(true);
      expect(isCodeReviewActivityEvent(result[1])).toBe(true);
      if (
        isCodeReviewActivityEvent(result[0]) &&
        isCodeReviewActivityEvent(result[1])
      ) {
        expect(result[0].codeReview.commentCount).toBe(8); // First three reviews grouped
        expect(result[1].codeReview.commentCount).toBe(1); // Last review in separate group
      }
    });

    it("mixed event types and authors correctly", () => {
      const baseDate = new Date("2024-01-01T00:00:00Z");
      const events: ActivityEventData[] = [
        createPullRequestEvent({
          type: "PULL_REQUEST_CREATED",
          eventAt: baseDate,
          pullRequest: { id: 1 },
        }),
        createCodeReviewEvent({
          eventAt: addMinutes(baseDate, 5),
          codeReview: {
            pullRequestId: 1,
            authorId: John,
            commentCount: 2,
          },
        }),
        createCodeReviewEvent({
          eventAt: addMinutes(baseDate, 15),
          codeReview: {
            pullRequestId: 1,
            authorId: John,
            commentCount: 3,
          },
        }),
        createPullRequestEvent({
          type: "PULL_REQUEST_MERGED",
          eventAt: addMinutes(baseDate, 20),
          pullRequest: { id: 1 },
        }),
        createCodeReviewEvent({
          eventAt: addMinutes(baseDate, 25),
          codeReview: {
            pullRequestId: 1,
            authorId: Jack,
            commentCount: 1,
          },
        }),
      ];

      const result = groupSerialReviews(events);
      expect(result).toHaveLength(4); // PR created, grouped reviews, PR merged
      expect(isCodeReviewActivityEvent(result[1])).toBe(true);
      if (isCodeReviewActivityEvent(result[1])) {
        expect(result[1].codeReview.commentCount).toBe(5); // All reviews grouped
      }
    });

    it("multiple PRs being reviewed around the same time", () => {
      const baseDate = new Date("2024-01-01T00:00:00Z");
      const events: ActivityEventData[] = [
        createCodeReviewEvent({
          eventAt: baseDate,
          codeReview: {
            pullRequestId: 1,
            authorId: John,
            commentCount: 2,
          },
        }),
        createCodeReviewEvent({
          eventAt: addMinutes(baseDate, 5),
          codeReview: {
            pullRequestId: 2,
            authorId: Jack,
            commentCount: 3,
          },
        }),
        createCodeReviewEvent({
          eventAt: addMinutes(baseDate, 15),
          codeReview: {
            pullRequestId: 1,
            authorId: John,
            commentCount: 3,
          },
        }),
        createCodeReviewEvent({
          eventAt: addMinutes(baseDate, 20),
          codeReview: {
            pullRequestId: 2,
            authorId: John,
            commentCount: 1,
          },
        }),
      ];

      const result = groupSerialReviews(events);

      expect(result).toHaveLength(3); // One group per PR/author
      expect(isCodeReviewActivityEvent(result[0])).toBe(true);
      expect(isCodeReviewActivityEvent(result[1])).toBe(true);

      if (
        isCodeReviewActivityEvent(result[0]) &&
        isCodeReviewActivityEvent(result[1]) &&
        isCodeReviewActivityEvent(result[2])
      ) {
        expect(result[0].codeReview.commentCount).toBe(5);
        expect(result[1].codeReview.commentCount).toBe(3);
        expect(result[2].codeReview.commentCount).toBe(1);
      }
    });

    it(`should group reviews that are exactly ${REVIEW_GROUPING_WINDOW_MINS} minutes apart`, () => {
      const baseDate = new Date("2024-01-01T00:00:00Z");
      const events = [
        createCodeReviewEvent({
          codeReview: {
            pullRequestId: 1,
            authorId: John,
            commentCount: 1,
          },
          eventAt: baseDate,
        }),
        createCodeReviewEvent({
          codeReview: {
            pullRequestId: 1,
            authorId: John,
            commentCount: 1,
          },
          eventAt: addMinutes(baseDate, REVIEW_GROUPING_WINDOW_MINS),
        }),
      ];

      const result = groupSerialReviews(events);

      expect(result).toHaveLength(1);
      expect(isCodeReviewActivityEvent(result[0])).toBe(true);

      if (isCodeReviewActivityEvent(result[0])) {
        expect(result[0].codeReview.commentCount).toBe(2);
      }
    });
  });

  describe("should not group", () => {
    it("non-code-review events", () => {
      const baseDate = new Date("2024-01-01T00:00:00Z");
      const events: ActivityEventData[] = [
        createPullRequestEvent({
          type: "PULL_REQUEST_CREATED",
          eventAt: baseDate,
          pullRequest: { id: 1 },
        }),
        createPullRequestEvent({
          type: "PULL_REQUEST_MERGED",
          eventAt: addMinutes(baseDate, 15),
          pullRequest: { id: 1 },
        }),
      ];

      const result = groupSerialReviews(events);
      expect(result).toEqual(events);
    });

    it("code reviews for different PRs", () => {
      const baseDate = new Date("2024-01-01T00:00:00Z");
      const events: ActivityEventData[] = [
        createCodeReviewEvent({
          eventAt: baseDate,
          codeReview: {
            pullRequestId: 1,
            authorId: John,
            commentCount: 2,
          },
        }),
        createCodeReviewEvent({
          eventAt: addMinutes(baseDate, 15),
          codeReview: {
            pullRequestId: 2,
            authorId: John,
            commentCount: 3,
          },
        }),
      ];

      const result = groupSerialReviews(events);

      expect(result).toHaveLength(2);
      expect(isCodeReviewActivityEvent(result[0])).toBe(true);
      expect(isCodeReviewActivityEvent(result[1])).toBe(true);

      if (
        isCodeReviewActivityEvent(result[0]) &&
        isCodeReviewActivityEvent(result[1])
      ) {
        expect(result[0].codeReview.commentCount).toBe(2);
        expect(result[1].codeReview.commentCount).toBe(3);
      }
    });

    it("code reviews for different authors on same PR", () => {
      const baseDate = new Date("2024-01-01T00:00:00Z");

      const events: ActivityEventData[] = [
        createCodeReviewEvent({
          eventAt: baseDate,
          codeReview: {
            pullRequestId: 1,
            authorId: John,
            commentCount: 2,
          },
        }),
        createCodeReviewEvent({
          eventAt: addMinutes(baseDate, 15),
          codeReview: {
            pullRequestId: 1,
            authorId: Jack,
            commentCount: 3,
          },
        }),
      ];

      const result = groupSerialReviews(events);

      expect(result).toHaveLength(2);
      expect(isCodeReviewActivityEvent(result[0])).toBe(true);
      expect(isCodeReviewActivityEvent(result[1])).toBe(true);

      if (
        isCodeReviewActivityEvent(result[0]) &&
        isCodeReviewActivityEvent(result[1])
      ) {
        expect(result[0].codeReview.commentCount).toBe(2);
        expect(result[1].codeReview.commentCount).toBe(3);
      }
    });

    it(`reviews that are exactly ${REVIEW_GROUPING_WINDOW_MINS} minutes and one second apart`, () => {
      const baseDate = new Date("2024-01-01T00:00:00Z");
      const events: ActivityEventData[] = [
        createCodeReviewEvent({
          eventAt: baseDate,
          codeReview: {
            pullRequestId: 1,
            authorId: John,
            commentCount: 2,
          },
        }),
        createCodeReviewEvent({
          eventAt: addSeconds(
            addMinutes(baseDate, REVIEW_GROUPING_WINDOW_MINS),
            1
          ),
          codeReview: {
            pullRequestId: 1,
            authorId: John,
            commentCount: 3,
          },
        }),
      ];

      const result = groupSerialReviews(events);

      expect(result).toHaveLength(2); // Should be separate groups
      expect(isCodeReviewActivityEvent(result[0])).toBe(true);
      expect(isCodeReviewActivityEvent(result[1])).toBe(true);

      if (
        isCodeReviewActivityEvent(result[0]) &&
        isCodeReviewActivityEvent(result[1])
      ) {
        expect(result[0].codeReview.commentCount).toBe(2);
        expect(result[1].codeReview.commentCount).toBe(3);
      }
    });
  });
});
