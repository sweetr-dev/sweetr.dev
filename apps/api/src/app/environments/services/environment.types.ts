export interface FindEnvironmentByIdInput {
  workspaceId: number;
  environmentId: number;
}

export interface PaginateEnvironmentsArgs {
  environmentIds?: number[];
  query?: string;
  limit?: number;
  cursor?: number;
}
