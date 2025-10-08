export interface FindRepositoryByIdArgs {
  workspaceId: number;
  repositoryId: number;
}

export interface FindRepositoriesByWorkspaceArgs {
  workspaceId: number;
  query?: string;
  limit?: number;
  repositoriesIds?: number[];
}
