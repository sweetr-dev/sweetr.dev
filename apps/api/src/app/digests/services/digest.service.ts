import { JsonObject } from "@prisma/client/runtime/library";
import { getPrisma } from "../../../prisma";
import {
  DigestTypeMap,
  FindDigestByTypeArgs,
  UpsertDigest,
  Digest,
  DigestWithRelations,
} from "./digest.types";
import { assign, isObject } from "radash";
import { DigestType } from "@prisma/client";
import { sendTeamMetricsDigest } from "./digest-team-metrics.service";
import { sendTeamWipDigest } from "./digest-team-wip.service";

export const findDigestByType = async <T extends DigestType>({
  workspaceId,
  teamId,
  type,
}: FindDigestByTypeArgs<T>): Promise<DigestTypeMap[T] | null> => {
  const digest = await getPrisma(workspaceId).digest.findFirst({
    where: {
      teamId,
      type,
    },
  });

  if (!digest) return null;

  return digest as DigestTypeMap[T];
};

export const findDigestsByTeam = async (
  workspaceId: number,
  teamId: number
) => {
  const digests = await getPrisma(workspaceId).digest.findMany({
    where: {
      teamId,
    },
  });

  return digests;
};

export const upsertDigest = async ({
  workspaceId,
  teamId,
  type,
  enabled,
  channel,
  frequency,
  dayOfTheWeek,
  timeOfDay,
  timezone,
  settings,
}: UpsertDigest) => {
  const digest = await getPrisma(workspaceId).digest.findUnique({
    where: {
      teamId_type: {
        teamId,
        type,
      },
    },
  });

  if (!digest) {
    const newDigest = await getPrisma(workspaceId).digest.create({
      data: {
        workspaceId,
        teamId,
        type,
        channel,
        frequency,
        dayOfTheWeek,
        timeOfDay,
        timezone,
        enabled: enabled ?? false,
        settings: isObject(settings) ? (settings as JsonObject) : {},
      },
    });

    return newDigest as unknown as Digest;
  }

  const updatedSettings = settings
    ? assign(digest.settings as object, settings)
    : digest.settings;

  const updatedDigest = await getPrisma(workspaceId).digest.update({
    where: {
      id: digest.id,
    },
    data: {
      enabled,
      channel,
      frequency,
      dayOfTheWeek,
      timeOfDay,
      timezone,
      settings: updatedSettings as JsonObject,
    },
  });

  return updatedDigest as unknown as Digest;
};

export const sendDigest = async (digest: DigestWithRelations) => {
  if (digest.type === DigestType.TEAM_METRICS) {
    await sendTeamMetricsDigest(digest);
  }

  if (digest.type === DigestType.TEAM_WIP) {
    await sendTeamWipDigest(digest);
  }
};
