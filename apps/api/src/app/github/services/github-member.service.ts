import { GitProfile, GitProvider } from "@prisma/client";
import {
  GITHUB_MAX_PAGE_LIMIT,
  getInstallationGraphQLOctoKit,
} from "../../../lib/octokit";
import { getPrisma } from "../../../prisma";
import { parallel } from "radash";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { logger } from "../../../lib/logger";
import { findWorkspaceByGitInstallationId } from "../../workspaces/services/workspace.service";

type GitOrganizationMember = {
  id: string;
  login: string;
  role: string;
  name?: string;
  avatarUrl?: string;
};

type MemberData = Omit<
  GitProfile,
  "id" | "userId" | "createdAt" | "updatedAt"
> & {
  role: string;
};

export const syncOrganizationMembers = async (
  gitInstallationId: number,
  organizationName: string
): Promise<void> => {
  logger.info("syncOrganizationMembers", {
    gitInstallationId,
    organizationName,
  });

  const workspace = await findWorkspaceOrThrow(gitInstallationId);

  const gitHubMembers = await fetchGitHubOrganizationMembers(
    gitInstallationId,
    organizationName
  );

  const membersData: MemberData[] = gitHubMembers.map((member) => ({
    gitProvider: GitProvider.GITHUB,
    gitUserId: member.id,
    handle: member.login,
    name: member.name || member.login,
    avatar: member.avatarUrl || null,
    role: member.role,
  }));

  const workspaceGitProfiles = await upsertGitProfiles(
    workspace.id,
    membersData
  );

  // Remove memberships that are no longer part of the organization
  await getPrisma(workspace.id).workspaceMembership.deleteMany({
    where: {
      workspaceId: workspace.id,
      gitProfileId: {
        notIn: workspaceGitProfiles.map((profile) => profile.id),
      },
    },
  });

  // Remove team memberships that are no longer part of the organization
  await getPrisma(workspace.id).teamMember.deleteMany({
    where: {
      workspaceId: workspace.id,
      gitProfileId: {
        notIn: workspaceGitProfiles.map((profile) => profile.id),
      },
    },
  });
};

const fetchGitHubOrganizationMembers = async (
  gitInstallationId: number,
  organizationName: string
): Promise<GitOrganizationMember[]> => {
  const fireGraphQLRequest =
    await getInstallationGraphQLOctoKit(gitInstallationId);

  const members: any[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const response: any = await fireGraphQLRequest({
      query: `
          query GetOrganizationMembers($login: String!, $cursor: String) {
            organization(login: $login) {
              membersWithRole(first: ${GITHUB_MAX_PAGE_LIMIT}, after: $cursor) {
                pageInfo {
                  endCursor
                  hasNextPage
                }
                nodes {
                  id
                  login
                  name
                  avatarUrl
                }
                edges {
                  role
                }
              }
            }
          }
        `,
      login: organizationName,
      cursor,
    });

    const { nodes, edges, pageInfo } = response.organization.membersWithRole;

    for (const [i, member] of nodes.entries()) {
      members.push({
        ...member,
        role: edges[i].role,
      });
    }

    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }

  return members;
};

const findWorkspaceOrThrow = async (gitInstallationId: number) => {
  const workspace = await findWorkspaceByGitInstallationId(
    gitInstallationId.toString()
  );

  if (!workspace) {
    throw new ResourceNotFoundException("Could not find workspace", {
      gitInstallationId,
    });
  }

  return workspace;
};

const upsertGitProfiles = async (
  workspaceId: number,
  membersData: MemberData[]
): Promise<GitProfile[]> => {
  return parallel(10, membersData, async (memberData) => {
    const { role, ...member } = memberData;

    const gitProfile = await getPrisma().gitProfile.upsert({
      where: {
        gitProvider_gitUserId: {
          gitProvider: GitProvider.GITHUB,
          gitUserId: member.gitUserId,
        },
      },
      create: member,
      update: member,
    });

    await getPrisma(workspaceId).workspaceMembership.upsert({
      where: {
        gitProfileId_workspaceId: {
          workspaceId,
          gitProfileId: gitProfile.id,
        },
      },
      create: {
        workspaceId,
        gitProfileId: gitProfile.id,
        role: role,
      },
      update: {
        role: role,
      },
    });

    return gitProfile;
  });
};
