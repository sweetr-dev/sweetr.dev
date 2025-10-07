interface DateTimeRange {
  from?: string;
  to?: string;
}

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
