import { Prisma } from "@prisma/client";
import { getPrisma, take } from "../../../prisma";

interface PaginateWorkspaceUsersArgs {
  cursor?: number;
  query?: string;
  limit?: number;
}

export const paginateWorkspaceUsers = async (
  workspaceId: number,
  args: PaginateWorkspaceUsersArgs
) => {
  const where: Prisma.GitProfileWhereInput = {
    workspaceMemberships: {
      some: {
        workspaceId,
      },
    },
  };

  if (args.query) {
    where.OR = [
      {
        handle: {
          contains: args.query,
          mode: "insensitive",
        },
      },
      {
        name: {
          contains: args.query,
          mode: "insensitive",
        },
      },
    ];
  }

  const profiles = await getPrisma(workspaceId).gitProfile.findMany({
    take: take(args.limit || 20),
    skip: args.cursor ? 1 : 0,
    cursor: args.cursor ? { id: args.cursor } : undefined,
    orderBy: [
      { name: "asc" },
      { id: "asc" },
    ],
    where,
    include: {
      user: true,
      workspaceMemberships: {
        where: { workspaceId },
        select: { role: true },
      },
    },
  });

  return profiles;
};
