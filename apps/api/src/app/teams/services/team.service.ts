import { Prisma, Team } from "@prisma/client";
import { getPrisma, take } from "../../../prisma";
import {
  FindTeamMembersInput,
  FindTeamsByWorkspaceInput,
  FindTeamByIdInput,
  UpsertTeamInput,
  AuthorizeTeamMembersInput,
} from "./team.types";
import { AuthorizationException } from "../../errors/exceptions/authorization.exception";

export const findTeamById = async ({
  teamId,
  workspaceId,
}: FindTeamByIdInput): Promise<Team | null> => {
  return getPrisma(workspaceId).team.findFirst({
    where: {
      id: teamId,
      workspaceId,
    },
  });
};

export const findTeamsByWorkspace = async ({
  workspaceId,
  ...args
}: FindTeamsByWorkspaceInput): Promise<Team[]> => {
  const query: Prisma.TeamFindManyArgs = {
    where: {
      workspaceId,
      archivedAt: null,
    },
    orderBy: {
      id: "asc",
    },
    take: take(args.limit),
  };

  if (args.query) {
    query.where = {
      ...query.where,
      name: {
        contains: args.query,
        mode: "insensitive",
      },
    };
  }

  return getPrisma(workspaceId).team.findMany(query);
};

export const findTeamMembershipsByGitProfile = async (
  workspaceId: number,
  gitProfileId: number
) => {
  return getPrisma(workspaceId).teamMember.findMany({
    where: {
      gitProfile: {
        id: gitProfileId,
        workspaceMemberships: {
          some: {
            workspaceId,
          },
        },
      },
      team: {
        archivedAt: null,
        workspaceId,
      },
    },
    orderBy: {
      id: "asc",
    },
  });
};

export const findTeammatesByGitProfile = async (
  workspaceId: number,
  gitProfileId: number
) => {
  return getPrisma(workspaceId).teamMember.findMany({
    where: {
      gitProfile: {
        NOT: { id: gitProfileId },
        workspaceMemberships: {
          some: {
            workspaceId,
          },
        },
      },
      team: {
        archivedAt: null,
        workspaceId,
        members: {
          some: {
            gitProfileId,
          },
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });
};

export const findTeamMemberById = async (
  workspaceId: number,
  teamMemberId: number
) => {
  return getPrisma(workspaceId).teamMember.findFirst({
    where: {
      id: teamMemberId,
    },
    include: {
      team: true,
      gitProfile: true,
    },
  });
};

export const findTeamMembers = async ({
  workspaceId,
  teamId,
}: FindTeamMembersInput) => {
  return getPrisma(workspaceId).teamMember.findMany({
    where: {
      teamId,
      team: {
        workspaceId,
      },
    },
    include: {
      team: true,
      gitProfile: true,
    },
  });
};

export const upsertTeam = async (input: UpsertTeamInput) => {
  const { teamId, members, ...teamData } = input;

  if (teamId) {
    // Remove all existing members to recreate it below
    await getPrisma(input.workspaceId).teamMember.deleteMany({
      where: { teamId },
    });
  }

  const memberCreateQuery = {
    createMany: {
      data: members.map((member) => ({
        workspaceId: input.workspaceId,
        gitProfileId: member.personId,
        role: member.role,
      })),
    },
  };

  const team = getPrisma(input.workspaceId).team.upsert({
    where: {
      id: teamId || 0,
    },
    create: {
      ...teamData,
      members: memberCreateQuery,
    },
    update: {
      ...teamData,
      members: memberCreateQuery,
    },
  });

  return team;
};

export const archiveTeam = async (workspaceId: number, teamId: number) => {
  return getPrisma(workspaceId).team.update({
    where: { id: teamId },
    data: { archivedAt: new Date() },
  });
};

export const unarchiveTeam = async (workspaceId: number, teamId: number) => {
  return getPrisma(workspaceId).team.update({
    where: { id: teamId },
    data: { archivedAt: null },
  });
};

export const authorizeTeamMembersOrThrow = async ({
  workspaceId,
  members,
}: AuthorizeTeamMembersInput) => {
  // Make sure all members belong to the workspace
  const peopleCount = await getPrisma(workspaceId).workspaceMembership.count({
    where: {
      workspaceId: workspaceId,
      gitProfileId: { in: members.map((member) => member.personId) },
    },
  });

  if (peopleCount !== members.length) {
    throw new AuthorizationException(
      "Some members do not belong to this workspace."
    );
  }
};
