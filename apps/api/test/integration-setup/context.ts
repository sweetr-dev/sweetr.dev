import { GitProvider } from "@prisma/client";
import { getBypassRlsPrisma } from "../../src/prisma";
import { randomUUID } from "crypto";

/**
 * Test context: provides workspace creation and isolation.
 *
 * Bypass is used only for workspace creation (the RLS policy checks
 * "id" = current_setting(...) which is a chicken-and-egg problem).
 * Everything else goes through getPrisma(workspaceId) — subject to
 * RLS tenant isolation, same as production.
 */
export interface TestContext {
  workspaceId: number;
}

export async function createTestContext(): Promise<TestContext> {
  const workspace = await getBypassRlsPrisma().workspace.create({
    data: {
      gitProvider: GitProvider.GITHUB,
      settings: {},
    },
  });

  return {
    workspaceId: workspace.id,
  };
}

export async function createTestContextWithGitProfile(
  handle: string = "test-user"
): Promise<TestContext & { gitProfileId: number }> {
  const bypassPrisma = getBypassRlsPrisma();

  // GitProfile has no RLS, but we use bypass since workspace creation needs it
  const gitProfile = await bypassPrisma.gitProfile.create({
    data: {
      gitProvider: GitProvider.GITHUB,
      gitUserId: `user-${Date.now()}-${randomUUID()}`,
      handle,
      name: handle,
    },
  });

  const workspace = await bypassPrisma.workspace.create({
    data: {
      gitProvider: GitProvider.GITHUB,
      settings: {},
      gitProfileId: gitProfile.id,
    },
  });

  return {
    workspaceId: workspace.id,
    gitProfileId: gitProfile.id,
  };
}
