export interface FindEnvironmentByIdArgs {
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

export interface ArchiveEnvironmentArgs {
  workspaceId: number;
  environmentId: number;
}

export interface UnarchiveEnvironmentArgs {
  workspaceId: number;
  environmentId: number;
}
