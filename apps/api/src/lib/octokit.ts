import { createAppAuth, StrategyOptions } from "@octokit/auth-app";
import { Octokit } from "octokit";
import { graphql } from "@octokit/graphql";
import { config } from "../config";
import { redisConnection } from "../bull-mq/redis-connection";

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

const redisCaching: StrategyOptions["cache"] = {
  async get(key: string) {
    const cachedValue = await redisConnection.get(`github:token:${key}`);
    return cachedValue || "";
  },
  set(key: string, value: string) {
    redisConnection.setex(`github:token:${key}`, 3600, value);
  },
};

export const getInstallationOctoKit = (installationId: number) =>
  new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: config.github.appId,
      privateKey: config.github.privateKey,
      installationId,
      cache: redisCaching,
    },
  });

export const getInstallationGraphQLOctoKit = (installationId: number) =>
  graphql.defaults({
    request: {
      hook: createAppAuth({
        appId: config.github.appId,
        privateKey: config.github.privateKey,
        installationId,
        cache: redisCaching,
      }).hook,
    },
  });

export const GITHUB_MAX_PAGE_LIMIT = 100;
