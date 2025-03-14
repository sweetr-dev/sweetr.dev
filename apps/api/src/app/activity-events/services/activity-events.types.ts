import { CodeReview } from "@prisma/client";

export type ActivityEventCodeReviewSubmitedMetadata = Pick<
  CodeReview,
  "state" | "commentCount"
>;
