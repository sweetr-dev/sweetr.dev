import {
  GITHUB_MAX_PAGE_LIMIT,
  getInstallationGraphQLOctoKit,
} from "../../../lib/octokit";
import { logger } from "../../../lib/logger";
import { findWorkspaceByGitInstallationIdOrThrow } from "../../workspaces/services/workspace.service";
import { getPrisma } from "../../../prisma";
import { objectify, unique } from "radash";
import { GitProfile, TeamMemberRole } from "@prisma/client";

type GitOrganizationTeam = {
  id: string;
  description?: string;
  name: string;
  members: GitTeamMember[];
};

type GitTeamMember = {
  id: string;
  login: string;
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

  const gitProfileMap = await getGitProfilesMap(workspace.id, gitHubTeams);

  await Promise.all(
    gitHubTeams.map(async (team) =>
      upsertTeam(workspace.id, gitProfileMap, team)
    )
  );
};

const getGitProfilesMap = async (
  workspaceId: number,
  teams: GitOrganizationTeam[]
) => {
  const allMembers = unique(
    teams.flatMap((team) => team.members).map((member) => member.login)
  );

  const gitProfiles = await getPrisma(workspaceId).gitProfile.findMany({
    where: {
      handle: {
        in: allMembers,
      },
    },
  });

  return objectify(gitProfiles, (gitProfile) => gitProfile.handle);
};

const upsertTeam = async (
  workspaceId: number,
  gitProfileMap: Record<string, GitProfile>,
  teamData: GitOrganizationTeam
) => {
  const { icon, startColor, endColor } = getTeamFlair(teamData.name);

  const members = teamData.members
    .filter((member) => gitProfileMap[member.login])
    .map((member) => ({
      workspaceId,
      gitProfileId: gitProfileMap[member.login].id,
      role: TeamMemberRole.ENGINEER,
    }));

  return getPrisma(workspaceId).team.upsert({
    where: {
      workspaceId_name: {
        workspaceId,
        name: teamData.name,
      },
    },
    create: {
      name: teamData.name,
      description: teamData.description,
      workspaceId,
      icon,
      startColor,
      endColor,
      members: {
        createMany: {
          data: members,
        },
      },
    },
    update: {},
  });
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
                  slug
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

    for (const [i, team] of nodes.entries()) {
      let remainingMembers: GitTeamMember[] = [];

      if (team.members.pageInfo?.hasNextPage) {
        remainingMembers = await fetchGitHubTeamMembers(
          gitInstallationId,
          organizationName,
          team.slug,
          team.members.pageInfo?.endCursor ?? null
        );
      }

      const teamMembers: GitTeamMember[] = [
        ...team.members.nodes,
        ...remainingMembers,
      ];

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

const fetchGitHubTeamMembers = async (
  gitInstallationId: number,
  organizationName: string,
  teamSlug: string,
  startCursor: string | null
): Promise<GitTeamMember[]> => {
  const fireGraphQLRequest =
    await getInstallationGraphQLOctoKit(gitInstallationId);

  const members: any[] = [];
  let hasNextPage = true;
  let cursor: string | null = startCursor;

  while (hasNextPage) {
    const response = await fireGraphQLRequest({
      query: `
          query GetTeamMembers($login: String!, $cursor: String, $slug: String!) {
            organization(login: $login) {
              team(slug: $slug) {
                id
                members(first: ${GITHUB_MAX_PAGE_LIMIT}, after: $cursor) {
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
        `,
      login: organizationName,
      cursor,
      slug: teamSlug,
    });

    const { pageInfo, nodes } = response.organization.team?.members;

    for (const [i, teamMember] of nodes.entries()) {
      members.push({
        id: teamMember.id,
        login: teamMember.login,
      });
    }

    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }

  return members;
};

const getTeamFlair = (teamName: string) => {
  const normalizedTeamName = teamName.toLowerCase().replace(/[^a-z0-9]/g, "");

  const color = {
    darkGray: "#25262b",
    gray: "#868e96",
    red: "#fa5252",
    pink: "#e64980",
    indigo: "#be4bdb",
    purple: "#7950f2",
    blue: "#4c6ef5",
    lightBlue: "#228be6",
    cyan: "#15aabf",
    teal: "#12b886",
    green: "#40c057",
    lime: "#82c91e",
    yellow: "#fab005",
    orange: "#fd7e14",
  };

  const presets = {
    engineering: {
      icon: "💪",
      startColor: color.cyan,
      endColor: color.purple,
    },
    design: {
      icon: "🎨",
      startColor: color.pink,
      endColor: color.purple,
    },
    product: {
      icon: "💻",
      startColor: color.green,
      endColor: color.yellow,
    },
    qa: {
      icon: "🐛",
      startColor: color.red,
      endColor: color.pink,
    },
    leadership: {
      icon: "👑",
      startColor: color.orange,
      endColor: color.red,
    },
    management: {
      icon: "👔",
      startColor: color.orange,
      endColor: color.red,
    },
    frontend: {
      icon: "💻",
      startColor: color.blue,
      endColor: color.purple,
    },
    backend: {
      icon: "💻",
      startColor: color.lightBlue,
      endColor: color.blue,
    },
    mobile: {
      icon: "📱",
      startColor: color.cyan,
      endColor: color.teal,
    },
    devops: {
      icon: "🏗️",
      startColor: color.green,
      endColor: color.lime,
    },
    infrastructure: {
      icon: "🏗️",
      startColor: color.green,
      endColor: color.lime,
    },
    security: {
      icon: "🔒",
      startColor: color.red,
      endColor: color.pink,
    },
    ai: {
      icon: "🤖",
      startColor: color.purple,
      endColor: color.indigo,
    },
    data: {
      icon: "📊",
      startColor: color.green,
      endColor: color.lime,
    },
    analytics: {
      icon: "📊",
      startColor: color.blue,
      endColor: color.purple,
    },
  };

  if (presets[normalizedTeamName]) {
    return presets[normalizedTeamName];
  }

  // Pick two random colors from the color picker swatches
  const startColor =
    Object.values(color)[
      Math.floor(Math.random() * Object.values(color).length)
    ];
  const endColor =
    Object.values(color)[
      Math.floor(Math.random() * Object.values(color).length)
    ];

  return {
    icon: "👥",
    startColor,
    endColor,
  };
};
