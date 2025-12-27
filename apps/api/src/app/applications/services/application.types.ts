import { JsonObject } from "@prisma/client/runtime/library";

export interface FindApplicationByIdArgs {
  workspaceId: number;
  applicationId: number;
}

export interface PaginateApplicationsArgs {
  applicationIds?: number[];
  cursor?: number;
  teamIds?: number[];
  query?: string;
  limit?: number;
  archivedOnly?: boolean;
}

export enum DeploymentSettingsTrigger {
  WEBHOOK = "WEBHOOK",
  MERGE = "MERGE",
  GIT_DEPLOYMENT = "GIT_DEPLOYMENT",
}

export interface DeploymentSettings extends JsonObject {
  trigger: DeploymentSettingsTrigger;
  subdirectory?: string | null;
}

export interface UpsertApplicationInput extends JsonObject {
  workspaceId: number;
  applicationId?: number;
  name: string;
  repositoryId: number;
  deploymentSettings: DeploymentSettings;
  teamId?: number | null;
  description?: string | null;
}

export interface FindApplicationByNameArgs {
  workspaceId: number;
  name: string;
}

export interface ArchiveApplicationArgs {
  workspaceId: number;
  applicationId: number;
}

export interface UnarchiveApplicationArgs {
  workspaceId: number;
  applicationId: number;
}
