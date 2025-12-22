import { Prisma } from "@prisma/client";

export interface FindRepositoryByIdArgs {
  workspaceId: number;
  repositoryId: number;
  include?: Partial<Prisma.RepositoryInclude>;
}

export interface FindRepositoriesByWorkspaceArgs {
  workspaceId: number;
  query?: string;
  limit?: number;
  repositoriesIds?: number[];
}

export interface FindRepositoryByFullNameArgs {
  workspaceId: number;
  fullName: string;
}
