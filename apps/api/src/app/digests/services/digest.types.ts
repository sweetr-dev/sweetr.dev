import {
  Installation,
  Subscription,
  Workspace,
  Digest as DbDigest,
  DigestType,
  Prisma,
  DayOfTheWeek,
  Frequency,
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
  frequency: Frequency;
  dayOfTheWeek: DayOfTheWeek[];
  timeOfDay: string;
  timezone: string;
  settings: DigestSettings;
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
