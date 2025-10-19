import { DateTimeRange } from "../../types";

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

export interface CreateDeploymentInput {
  workspaceId: number;
  version: string;
  environmentId: number;
  applicationId: number;
  deployedAt: Date;
  authorId?: number | null;
  description?: string | null;
}
