interface DateTimeRange {
  from?: string;
  to?: string;
}

export interface FindIncidentByIdInput {
  workspaceId: number;
  incidentId: number;
}

export interface PaginateIncidentsInput {
  cursor?: number;
  environmentIds?: number[];
  applicationIds?: number[];
  detectedAt?: DateTimeRange;
  limit?: number;
}

export interface UpsertIncidentInput {
  workspaceId: number;
  incidentId?: number;
  applicationId: number;
  detectedAt: Date;
  resolvedAt?: Date | null;
  causeDeploymentId: number;
  fixDeploymentId?: number | null;
  teamId?: number | null;
  postmortemUrl?: string | null;
  leaderId?: number | null;
}
