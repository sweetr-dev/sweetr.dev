import {
  PullRequest,
  GitProfile,
  PullRequestTracking,
  Repository,
  TeamMember,
} from "@prisma/client";

export type PullRequestWithRelations = PullRequest & {
  author: GitProfile & { teamMemberships: TeamMember[] };
  repository: Repository;
  tracking: PullRequestTracking | null;
};
