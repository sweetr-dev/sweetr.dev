import { DeploymentChangeType, Prisma } from "@prisma/client";
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

export interface FindDeploymentByIdArgs<
  TInclude extends Prisma.DeploymentInclude | undefined = undefined,
> {
  workspaceId: number;
  deploymentId: number;
  include?: TInclude;
}

export interface FindLastProductionDeploymentByApplicationIdArgs {
  workspaceId: number;
  applicationId: number;
}

export interface UpsertDeploymentInput {
  workspaceId: number;
  version: string;
  commitHash: string;
  environmentId: number;
  applicationId: number;
  deployedAt: Date;
  authorId?: number | null;
  description?: string | null;
  changeType?: DeploymentChangeType | null;
}

export interface AutoLinkPullRequestsToDeploymentArgs {
  deploymentId: number;
  workspaceId: number;
}

export interface FindPreviousDeploymentArgs {
  workspaceId: number;
  applicationId: number;
  environmentId: number;
  beforeDeploymentId?: number;
}
