import { Prisma, Team } from "@prisma/client";
import { getPrisma, take } from "../../../prisma";
import {
  FindTeamMembersArgs,
  FindTeamsByWorkspaceArgs,
  FindTeamByIdArgs,
  UpsertTeamInput,
} from "./team.types";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { validateInputOrThrow } from "../../validator.service";
import { getTeamValidationSchema } from "./team.validation";

export const findTeamById = async ({
  teamId,
  workspaceId,
}: FindTeamByIdArgs): Promise<Team | null> => {
  return getPrisma(workspaceId).team.findUnique({
    where: {
      id: teamId,
      workspaceId,
    },
  });
};

export const findTeamByIdOrThrow = async ({
  teamId,
  workspaceId,
}: FindTeamByIdArgs) => {
  const team = await findTeamById({ teamId, workspaceId });

  if (!team) {
    throw new ResourceNotFoundException("Team not found");
  }

  return team;
};

export const findTeamsByWorkspace = async ({
  workspaceId,
  ...args
}: FindTeamsByWorkspaceArgs): Promise<Team[]> => {
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

  if (args.teamIds && args.teamIds.length) {
    query.where = {
      ...query.where,
      id: { in: args.teamIds },
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
      workspaceId,
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
}: FindTeamMembersArgs) => {
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
  const { teamId, members, ...teamData } = await validateInputOrThrow(
    getTeamValidationSchema(input.workspaceId),
    input
  );

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
    where: { id: teamId, workspaceId },
    data: { archivedAt: new Date() },
  });
};

export const unarchiveTeam = async (workspaceId: number, teamId: number) => {
  return getPrisma(workspaceId).team.update({
    where: { id: teamId, workspaceId },
    data: { archivedAt: null },
  });
};
