import {
  GITHUB_MAX_PAGE_LIMIT,
  getInstallationGraphQLOctoKit,
} from "../../../lib/octokit";
import { logger } from "../../../lib/logger";
import { findWorkspaceByGitInstallationIdOrThrow } from "../../workspaces/services/workspace.service";

type GitOrganizationTeam = {
  id: string;
  description?: string;
  name: string;
  members: {
    id: string;
    login: string;
  }[];
};

export const syncOrganizationTeams = async (
  gitInstallationId: number,
  organizationName: string
): Promise<void> => {
  logger.info("syncOrganizationTeams", {
    gitInstallationId,
    organizationName,
  });

  const workspace = await findWorkspaceByGitInstallationIdOrThrow(
    gitInstallationId.toString()
  );

  const gitHubTeams = await fetchGitHubOrganizationTeams(
    gitInstallationId,
    organizationName
  );

  console.log(gitHubTeams);
};

const fetchGitHubOrganizationTeams = async (
  gitInstallationId: number,
  organizationName: string
): Promise<GitOrganizationTeam[]> => {
  const fireGraphQLRequest =
    await getInstallationGraphQLOctoKit(gitInstallationId);

  const teams: any[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const response = await fireGraphQLRequest({
      query: `
          query GetOrganizationTeams($login: String!, $cursor: String) {
            organization(login: $login) {
              teams(first: ${GITHUB_MAX_PAGE_LIMIT}, after: $cursor, privacy: VISIBLE) {
                pageInfo {
                  endCursor
                  hasNextPage
                }
                nodes {
                  id
                  description 
                  name
                  members(first: ${GITHUB_MAX_PAGE_LIMIT}) {
                    pageInfo {
                      endCursor
                      hasNextPage
                    }
                    nodes {
                      id
                      login
                    }
                  }
                }
              }
            }
          }
        `,
      login: organizationName,
      cursor,
    });

    const { nodes, pageInfo } = response.organization.teams;

    const remainingMembers = [];

    for (const [i, team] of nodes.entries()) {
      console.log(team.name);

      if (team.members.pageInfo?.hasNextPage) {
        // We'll implement method to fetch remaining members later
      }

      const teamMembers = [...team.members.nodes, ...remainingMembers];

      console.log("teamMembers are", teamMembers);

      teams.push({
        id: team.id,
        description: team.description,
        name: team.name,
        members: teamMembers.map((member) => ({
          id: member.id,
          login: member.login,
        })),
      });
    }

    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }

  return teams;
};
