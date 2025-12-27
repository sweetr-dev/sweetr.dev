import { DateTimeRange } from "../../types";

export interface FindIncidentByIdArgs {
  workspaceId: number;
  incidentId: number;
}

export interface PaginateIncidentsArgs {
  cursor?: number;
  environmentIds?: number[];
  applicationIds?: number[];
  detectedAt?: DateTimeRange;
  limit?: number;
}

export interface UpsertIncidentInput {
  workspaceId: number;
  incidentId?: number;
  detectedAt: Date;
  resolvedAt?: Date | null;
  causeDeploymentId: number;
  fixDeploymentId?: number | null;
  teamId?: number | null;
  postmortemUrl?: string | null;
  leaderId?: number | null;
}

export interface ArchiveIncidentArgs {
  workspaceId: number;
  incidentId: number;
}

export interface UnarchiveIncidentArgs {
  workspaceId: number;
  incidentId: number;
}
