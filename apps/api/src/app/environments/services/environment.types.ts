export interface FindEnvironmentByIdInput {
  workspaceId: number;
  environmentId: number;
}

export interface PaginateEnvironmentsArgs {
  environmentIds?: number[];
  query?: string;
  limit?: number;
  cursor?: number;
  includeArchived?: boolean;
}

export interface ArchiveEnvironmentInput {
  workspaceId: number;
  environmentId: number;
}

export interface UnarchiveEnvironmentInput {
  workspaceId: number;
  environmentId: number;
}
