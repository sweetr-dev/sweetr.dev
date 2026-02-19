import { PullRequest } from "@prisma/client";

export interface FilterPullRequestsBySubdirectoryArgs<
  T extends PullRequest = PullRequest,
> {
  pullRequests: T[];
  subdirectory?: string;
}

export interface HasChangedFilesInSubdirectoryArgs {
  files: { path: string }[];
  subdirectory: string;
}
