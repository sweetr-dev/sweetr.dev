import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "octokit";
import { graphql } from "@octokit/graphql";
import { config } from "../config";

export const octokit = new Octokit();

export const getAppOctoKit = () =>
  new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: config.github.appId,
      privateKey: config.github.privateKey,
      clientId: config.github.clientId,
      clientSecret: config.github.clientSecret,
    },
  });

export const getInstallationOctoKit = (installationId: number) =>
  new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: config.github.appId,
      privateKey: config.github.privateKey,
      installationId,
    },
  });

export const getInstallationGraphQLOctoKit = (installationId: number) =>
  graphql.defaults({
    request: {
      hook: createAppAuth({
        appId: config.github.appId,
        privateKey: config.github.privateKey,
        installationId,
      }).hook,
    },
  });

export const GITHUB_MAX_PAGE_LIMIT = 100;
