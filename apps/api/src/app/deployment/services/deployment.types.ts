interface DateTimeRange {
  from?: string;
  to?: string;
}

export interface PaginateDeploymentsArgs {
  cursor?: number;
  environmentIds?: number[];
  applicationIds?: number[];
  deployedAt?: DateTimeRange;
  limit?: number;
}

export interface FindDeploymentByIdArgs {
  workspaceId: number;
  deploymentId: number;
}
