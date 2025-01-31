import { TeamMemberRole } from "../../../graphql-types";

export interface FindTeamByIdInput {
  workspaceId: number;
  teamId: number;
}

export interface FindTeamMembersInput {
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

export interface FindTeamsByWorkspaceInput {
  workspaceId: number;
  query?: string;
  limit?: number;
}

export interface AuthorizeTeamInput {
  teamId: number;
  gitProfileId: number;
}

export interface AuthorizeTeamMembersInput {
  workspaceId: number;
  members: {
    personId: number;
  }[];
}
