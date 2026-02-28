import { GitProfile } from "@prisma/client";
import {
  GITHUB_MAX_PAGE_LIMIT,
  getInstallationGraphQLOctoKit,
} from "../../../lib/octokit";
import { getPrisma } from "../../../prisma";
import { parallel } from "radash";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { upsertGitProfile } from "../../gitProfile/services/git-profile.service";
import { logger } from "../../../lib/logger";
import { findWorkspaceByGitInstallationId } from "../../workspaces/services/workspace.service";
import { gitHubUserToGitProfileData } from "./github-user.service";
import { GitHubUser } from "./github-user.types";

type GitOrganizationMember = {
  id: string;
  login: string;
  role: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
};

type MemberData = GitHubUser & {
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
    nodeId: member.id,
    ...member,
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
  const fireGraphQLRequest = getInstallationGraphQLOctoKit(gitInstallationId);

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
                  bio
                  location
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

    const gitProfile = await upsertGitProfile(
      gitHubUserToGitProfileData(member)
    );

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
