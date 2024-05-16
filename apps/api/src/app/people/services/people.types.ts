export interface PaginateGitProfilesArgs {
  cursor?: number;
  query?: string;
  limit?: number;
}

export interface FindGitProfileByHandleArgs {
  workspaceId: number;
  handle: string;
}

export interface FindGitProfileByIdArgs {
  workspaceId: number;
  gitProfileId: number;
}
