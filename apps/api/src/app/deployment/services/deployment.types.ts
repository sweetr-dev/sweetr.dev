interface DateTimeRange {
  from?: string;
  to?: string;
}

export interface PaginateDeploymentsInput {
  cursor?: number;
  environmentIds?: number[];
  applicationIds?: number[];
  deployedAt?: DateTimeRange;
  limit?: number;
}

export interface FindDeploymentByIdInput {
  workspaceId: number;
  deploymentId: number;
}

export interface FindLastProductionDeploymentByApplicationIdInput {
  workspaceId: number;
  applicationId: number;
}
