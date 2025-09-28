import {
  GitProfile,
  GitProvider,
  User,
  WorkspaceMembership,
  InstallationTargetType,
} from "@prisma/client";
import jwt from "jsonwebtoken";
import { config } from "../../../config";
import { getBypassRlsPrisma, getPrisma } from "../../../prisma";
import * as github from "../providers/github/github.provider";
import { GithubUser } from "../providers/github/github.types";
import { JWTPayload, Token } from "./auth.types";
import { Installation as GitInstallation } from "@octokit/webhooks-types";
import { logger } from "../../../lib/logger";
import { captureException } from "../../../lib/sentry";
import { BusinessRuleException } from "../../errors/exceptions/business-rule.exception";
import { DataAccessException } from "../../errors/exceptions/data-access.exception";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import { UnknownException } from "../../errors/exceptions/unknown.exception";
import {
  getTemporaryNonce,
  preventCSRFAttack,
} from "../../authorization.service";

export const loginWithGithub = async (
  code: string,
  state: string
): Promise<Token> => {
  await preventCSRFAttack(state.split(":::").at(-1) || "");

  const githubToken = await github.authorize(code);

  const githubUser = await github.getUserInfo(githubToken.access_token);

  if (!githubUser) {
    throw new UnknownException("loginWithGithub: Something went wrong.");
  }

  const gitProfile = await createOrSyncProfile(githubUser);

  await connectGitProfileToWorkspaces(
    gitProfile.id,
    githubUser.node_id,
    githubUser.installations
  );

  return signJwtToken({
    userId: gitProfile.user.id,
    gitProfileId: gitProfile.id,
    gitProvider: {
      provider: GitProvider.GITHUB,
      accessToken: githubToken.access_token,
      tokenType: githubToken.token_type,
      scope: githubToken.scope,
    },
  });
};

export const getGithubLoginUrl = (redirectTo?: string) => {
  return github.getGithubAuthtUrl(getLoginState(redirectTo));
};

const signJwtToken = (payload: JWTPayload): Token => {
  const expiresIn = config.auth.jwt.expiresIn;

  const accessToken = jwt.sign(payload, config.auth.jwt.secret, {
    expiresIn,
  });

  return {
    accessToken,
  };
};

const getLoginState = (redirectTo: string = "/") => {
  return `${redirectTo}:::${getTemporaryNonce()}`;
};

export const createOrSyncProfile = async (
  githubUser: Pick<
    GithubUser,
    "node_id" | "login" | "name" | "email" | "avatar_url"
  >
): Promise<
  GitProfile & {
    user: User;
    workspaceMemberships: WorkspaceMembership[];
  }
> => {
  const { login, name, email, avatar_url, node_id } = githubUser;

  const handle = login;

  const gitProfile = await getBypassRlsPrisma().gitProfile.upsert({
    where: {
      gitProvider_gitUserId: {
        gitUserId: node_id,
        gitProvider: GitProvider.GITHUB,
      },
    },
    update: {
      handle,
      name: name || handle,
      avatar: avatar_url,
      user: {
        upsert: {
          update: {
            slug: createUserSlug(GitProvider.GITHUB, handle),
            email: email,
          },
          create: {
            slug: createUserSlug(GitProvider.GITHUB, handle),
            email: email,
          },
        },
      },
    },
    create: {
      gitProvider: GitProvider.GITHUB,
      avatar: avatar_url,
      name: name || handle,
      gitUserId: node_id,
      handle,
      user: {
        create: {
          slug: createUserSlug(GitProvider.GITHUB, handle),
          email: email,
        },
      },
    },
    include: {
      workspaceMemberships: true,
      user: true,
    },
  });

  if (!gitProfile.user) {
    throw new DataAccessException("createOrSyncProfile: Could not upsert user");
  }

  return {
    ...gitProfile,
    user: gitProfile.user,
  };
};

const createUserSlug = (provider: GitProvider, handle: string): string => {
  if (provider === GitProvider.GITHUB) {
    return `gh-${handle}`;
  }

  throw new InputValidationException(
    "createUserSlug: Unsupported OAuth provider"
  );
};

export const deleteUserByGitUserId = async (
  gitUserId: string
): Promise<boolean> => {
  const gitProfile = await getPrisma().gitProfile.findFirstOrThrow({
    where: { gitProvider: GitProvider.GITHUB, gitUserId: gitUserId.toString() },
  });

  if (!gitProfile.userId) return true;

  await getPrisma().user.delete({
    where: {
      id: gitProfile.userId,
    },
  });

  return true;
};

const connectGitProfileToWorkspaces = async (
  gitProfileId: number,
  gitId: string,
  gitInstallations: GitInstallation[]
) => {
  logger.info("connectUserToInstallations", { gitProfileId, gitInstallations });

  const installationIds = gitInstallations.map((installation) =>
    installation.id.toString()
  );

  const dbInstallations = await getBypassRlsPrisma().installation.findMany({
    where: {
      gitInstallationId: {
        in: installationIds,
      },
      OR: [
        {
          targetType: InstallationTargetType.ORGANIZATION,
        },
        {
          targetType: InstallationTargetType.USER,
          targetId: gitId,
        },
      ],
    },
    include: {
      workspace: true,
    },
  });

  if (dbInstallations.length !== gitInstallations.length) {
    captureException(
      new BusinessRuleException(
        "User has installations that are not in the database",
        {
          severity: "debug",
          extra: { gitProfileId, gitInstallations, dbInstallations },
        }
      )
    );
  }

  for (const installation of dbInstallations) {
    const workspaceId = installation.workspaceId;

    logger.info(
      {
        gitProfileId,
        workspaceId,
        installationId: installation.id,
        gitInstallationId: installation.gitInstallationId,
      },
      "connectUserToInstallations: Adding missing memberships"
    );

    await getPrisma(workspaceId).workspaceMembership.upsert({
      where: {
        gitProfileId_workspaceId: {
          workspaceId,
          gitProfileId,
        },
      },
      update: {},
      create: {
        workspaceId,
        gitProfileId,
      },
    });

    if (
      installation.targetType === InstallationTargetType.USER &&
      !installation.workspace.gitProfileId
    ) {
      logger.info(
        {
          gitProfileId,
          workspaceId,
          installationId: installation.id,
          gitInstallationId: installation.gitInstallationId,
        },
        "connectUserToInstallations: reconnect orphan personal workspace"
      );

      await getPrisma(workspaceId).workspace.update({
        where: {
          id: workspaceId,
        },
        data: {
          gitProfileId,
        },
      });
    }
  }
};
