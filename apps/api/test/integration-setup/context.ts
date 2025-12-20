import { PrismaClient, GitProvider } from "@prisma/client";
import { getTestPrismaClient } from "./prisma-client";

/**
 * Test context: provides workspace creation and isolation.
 * Each test or scenario must create its own workspace.
 * No shared or global workspaces - mandatory for multi-tenancy.
 */
export interface TestContext {
  workspaceId: number;
  prisma: PrismaClient;
}

/**
 * Creates a new test context with a fresh workspace.
 * This is the entry point for all tests - every test must start here.
 */
export async function createTestContext(): Promise<TestContext> {
  const prisma = getTestPrismaClient();

  // Create a minimal workspace for this test
  // All data will be scoped to this workspaceId
  const workspace = await prisma.workspace.create({
    data: {
      gitProvider: GitProvider.GITHUB,
      settings: {},
    },
  });

  return {
    workspaceId: workspace.id,
    prisma,
  };
}

/**
 * Helper to create a workspace with a GitProfile (for PRs, deployments, etc.)
 */
export async function createTestContextWithGitProfile(
  handle: string = "test-user"
): Promise<TestContext & { gitProfileId: number }> {
  const prisma = getTestPrismaClient();

  const gitProfile = await prisma.gitProfile.create({
    data: {
      gitProvider: GitProvider.GITHUB,
      gitUserId: `user-${Date.now()}-${Math.random()}`,
      handle,
      name: handle,
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      gitProvider: GitProvider.GITHUB,
      settings: {},
      gitProfileId: gitProfile.id,
    },
  });

  return {
    workspaceId: workspace.id,
    gitProfileId: gitProfile.id,
    prisma,
  };
}
