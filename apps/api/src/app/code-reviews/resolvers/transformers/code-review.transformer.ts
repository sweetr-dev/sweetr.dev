import { CodeReview as DatabaseCodeReview, GitProfile } from "@prisma/client";
import {
  CodeReview as ApiCodeReview,
  CodeReviewState,
} from "../../../../graphql-types";

export const transformCodeReview = (
  codeReview: DatabaseCodeReview
): Omit<ApiCodeReview, "pullRequest" | "author"> => {
  return {
    ...codeReview,
    createdAt: codeReview.createdAt.toISOString(),
    state: codeReview.state as CodeReviewState,
  };
};
