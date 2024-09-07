import { CodeReview as DatabaseCodeReview, GitProfile } from "@prisma/client";
import {
  CodeReview as ApiCodeReview,
  CodeReviewState,
} from "@sweetr/graphql-types/api";

export const transformCodeReview = (
  codeReview: DatabaseCodeReview & {
    author: GitProfile;
  }
): Omit<ApiCodeReview, "pullRequest" | "author"> => {
  return {
    ...codeReview,
    createdAt: codeReview.createdAt.toISOString(),
    state: codeReview.state as CodeReviewState,
  };
};
