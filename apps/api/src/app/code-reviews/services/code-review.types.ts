import { CodeReviewState } from "@prisma/client";

export interface PaginateCodeReviewsArgs {
  cursor?: number;
  from?: Date;
  to?: Date;
  state?: CodeReviewState;
}
