import {
  GitProfile,
  PullRequest,
  PullRequestTracking,
  Repository,
} from "@prisma/client";

export type PullRequestWithRelations = PullRequest & {
  author: GitProfile;
  repository: Repository;
  tracking: PullRequestTracking | null;
};
