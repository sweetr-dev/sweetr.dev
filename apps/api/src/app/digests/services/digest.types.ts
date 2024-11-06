import {
  Installation,
  Subscription,
  Workspace,
  Digest as DbDigest,
  DigestType,
  Prisma,
} from "@prisma/client";

export type Digest = Omit<DbDigest, "settings"> & {
  settings: DigestSettings;
};

export interface FindDigestByTypeArgs<T extends DigestType> {
  workspaceId: number;
  teamId: number;
  type: T;
}

export interface UpsertDigest {
  workspaceId: number;
  teamId: number;
  type: DigestType;
  enabled: boolean;
  channel: string;
  frequency: string;
  dayOfTheWeek: number;
  timeOfDay: string;
  timezone: string;
  settings: object;
}

export interface GetDigestDataArgs {
  gitInstallationId: number;
  type: DigestType;
}

export interface CanSendDigestArgs {
  digest: Pick<Digest, "enabled">;
  workspace: Workspace & {
    subscription: Subscription | null;
    installation: Installation | null;
  };
}

export type DigestTypeMap = {
  [DigestType.TEAM_METRICS]: DigestTeamMetrics;
  [DigestType.TEAM_WIP]: DigestTeamWip;
};

export interface DigestTeamMetrics extends Omit<Digest, "settings"> {
  type: typeof DigestType.TEAM_METRICS;
  settings: Prisma.JsonObject;
}

export interface DigestTeamWip extends Omit<Digest, "settings"> {
  type: typeof DigestType.TEAM_WIP;
  settings: Prisma.JsonObject;
}

export type DigestSettings = Prisma.JsonObject;
