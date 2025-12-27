export interface FindEnvironmentByIdArgs {
  workspaceId: number;
  environmentId: number;
}

export interface PaginateEnvironmentsArgs {
  environmentIds?: number[];
  query?: string;
  limit?: number;
  cursor?: number;
  archivedOnly?: boolean;
}

export interface ArchiveEnvironmentArgs {
  workspaceId: number;
  environmentId: number;
}

export interface UnarchiveEnvironmentArgs {
  workspaceId: number;
  environmentId: number;
}

export interface FindOrCreateEnvironmentArgs {
  workspaceId: number;
  name: string;
}
