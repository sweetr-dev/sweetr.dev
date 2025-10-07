interface DateTimeRange {
  from?: string;
  to?: string;
}

export interface PaginateDeploymentsArgs {
  deploymentIds?: number[];
  query?: string;
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

export interface FindLastProductionDeploymentByApplicationIdArgs {
  workspaceId: number;
  applicationId: number;
}
