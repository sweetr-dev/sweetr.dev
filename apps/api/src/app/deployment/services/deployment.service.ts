import { Prisma } from "@prisma/client";
import { getPrisma, take } from "../../../prisma";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import {
  ArchiveDeploymentArgs,
  FindDeploymentByIdArgs,
  FindLastProductionDeploymentByApplicationIdArgs,
  FindPreviousDeploymentArgs,
  PaginateDeploymentsArgs,
  UnarchiveDeploymentArgs,
  UpsertDeploymentInput,
} from "./deployment.types";

export async function findDeploymentById<
  TInclude extends Prisma.DeploymentInclude | undefined = undefined,
>(
  { workspaceId, deploymentId }: FindDeploymentByIdArgs,
  { include }: { include?: TInclude } = {}
) {
  return getPrisma(workspaceId).deployment.findUnique({
    where: { id: deploymentId, workspaceId },
    include,
  }) as Prisma.Prisma__DeploymentClient<
    Prisma.DeploymentGetPayload<{ include: TInclude }>
  >;
}

export async function findDeploymentByIdOrThrow<
  TInclude extends Prisma.DeploymentInclude | undefined = undefined,
>(
  { workspaceId, deploymentId }: FindDeploymentByIdArgs,
  { include }: { include?: TInclude } = {}
) {
  const deployment = await findDeploymentById(
    { workspaceId, deploymentId },
    { include }
  );

  if (!deployment) {
    throw new ResourceNotFoundException("Deployment not found");
  }

  return deployment;
}

export const findDeploymentWithRelations = async ({
  workspaceId,
  deploymentId,
}: FindDeploymentByIdArgs) => {
  return getPrisma(workspaceId).deployment.findUnique({
    where: { id: deploymentId, workspaceId },
    include: { application: { include: { repository: true } } },
  });
};

export const findLatestDeployment = async ({
  workspaceId,
  applicationId,
  environmentId,
  beforeDeploymentId,
}: FindPreviousDeploymentArgs) => {
  return getPrisma(workspaceId).deployment.findFirst({
    where: {
      workspaceId,
      applicationId,
      environmentId,
      archivedAt: null,
      id: beforeDeploymentId ? { lt: beforeDeploymentId } : undefined,
    },
    orderBy: { deployedAt: "desc" },
  });
};

export const paginateDeployments = async (
  workspaceId: number,
  args: PaginateDeploymentsArgs
) => {
  const query: Prisma.DeploymentFindManyArgs = {
    take: take(args.limit),
    skip: args.cursor ? 1 : 0,
    cursor: args.cursor ? { id: args.cursor } : undefined,
    where: {
      workspaceId,
      archivedAt: args.archivedOnly ? { not: null } : null,
      environment: { archivedAt: null },
      application: { archivedAt: null },
    },
    orderBy: { deployedAt: "desc" },
  };

  if (args.deploymentIds?.length) {
    query.where = { ...query.where, id: { in: args.deploymentIds } };
  }

  if (args.query) {
    query.where = {
      ...query.where,
      OR: [
        { version: { contains: args.query, mode: "insensitive" } },
        { description: { contains: args.query, mode: "insensitive" } },
      ],
    };
  }

  if (args.deployedAt?.from || args.deployedAt?.to) {
    query.where = {
      ...query.where,
      deployedAt: { gte: args.deployedAt.from, lte: args.deployedAt.to },
    };
  }

  if (args.applicationIds?.length) {
    query.where = {
      ...query.where,
      applicationId: { in: args.applicationIds },
    };
  }

  if (args.environmentIds?.length) {
    query.where = {
      ...query.where,
      environmentId: { in: args.environmentIds },
    };
  }

  return getPrisma(workspaceId).deployment.findMany(query);
};

export const findLastProductionDeploymentByApplicationId = async ({
  workspaceId,
  applicationId,
}: FindLastProductionDeploymentByApplicationIdArgs) => {
  return getPrisma(workspaceId).deployment.findFirst({
    where: {
      workspaceId,
      applicationId,
      archivedAt: null,
      environment: { isProduction: true, archivedAt: null },
    },
    orderBy: { deployedAt: "desc" },
  });
};

export const upsertDeployment = async (input: UpsertDeploymentInput) => {
  return getPrisma(input.workspaceId).deployment.upsert({
    where: {
      workspaceId_environmentId_applicationId_version_deployedAt: {
        workspaceId: input.workspaceId,
        environmentId: input.environmentId,
        applicationId: input.applicationId,
        version: input.version,
        deployedAt: input.deployedAt,
      },
    },
    create: input,
    update: input,
  });
};

export const archiveDeployment = async ({
  workspaceId,
  deploymentId,
}: ArchiveDeploymentArgs) => {
  return getPrisma(workspaceId).deployment.update({
    where: { id: deploymentId },
    data: { archivedAt: new Date() },
  });
};

export const unarchiveDeployment = async ({
  workspaceId,
  deploymentId,
}: UnarchiveDeploymentArgs) => {
  return getPrisma(workspaceId).deployment.update({
    where: { id: deploymentId },
    data: { archivedAt: null },
  });
};
