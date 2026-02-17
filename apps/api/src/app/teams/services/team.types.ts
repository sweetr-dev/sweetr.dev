import { TeamMemberRole } from "../../../graphql-types";

export interface FindTeamByIdArgs {
  workspaceId: number;
  teamId: number;
}

export interface FindTeamMembersArgs {
  workspaceId: number;
  teamId: number;
}

export interface UpsertTeamInput {
  workspaceId: number;
  teamId?: number;
  name: string;
  description?: string | null;
  icon: string;
  startColor: string;
  endColor: string;
  members: {
    personId: number;
    role: TeamMemberRole;
  }[];
}

export interface FindTeamsByWorkspaceArgs {
  workspaceId: number;
  teamIds?: number[];
  query?: string;
  limit?: number;
  archivedOnly?: boolean;
}

export interface CountTeamMembersArgs {
  workspaceId: number;
  members: {
    personId: number;
  }[];
}
