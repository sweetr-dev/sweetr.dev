import { PullRequest } from "@prisma/client";

export interface FilterPullRequestsBySubdirectoryArgs {
  pullRequests: PullRequest[];
  subdirectory?: string;
}

export interface HasChangedFilesInSubdirectoryArgs {
  files: { path: string }[];
  subdirectory: string;
}
