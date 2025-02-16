import { JsonObject } from "@prisma/client/runtime/library";
import { getPrisma } from "../../../prisma";
import { assign, isObject } from "radash";
import { AlertType } from "@prisma/client";
import {
  Alert,
  AlertTypeMap,
  AlertWithTeam,
  FindActiveAlerts,
  FindAlertByTypeArgs,
  UpsertAlert,
} from "./alert.types";

export const findTeamAlertByType = async <T extends AlertType>({
  workspaceId,
  teamId,
  type,
}: FindAlertByTypeArgs<T>): Promise<AlertTypeMap[T] | null> => {
  const alert = await getPrisma(workspaceId).alert.findFirst({
    where: {
      teamId,
      type,
    },
  });

  if (!alert) return null;

  return alert as AlertTypeMap[T];
};

export const findTeamActiveAlerts = async <T extends AlertType>({
  workspaceId,
  teamIds,
  type,
}: FindActiveAlerts<T>) => {
  const alerts = await getPrisma(workspaceId).alert.findMany({
    where: {
      teamId: {
        in: teamIds,
      },
      type,
      enabled: true,
    },
    include: {
      team: true,
    },
  });

  return alerts.map((alert) => alert as AlertWithTeam<T>);
};

export const findAlertsByTeam = async (workspaceId: number, teamId: number) => {
  const alerts = await getPrisma(workspaceId).alert.findMany({
    where: {
      teamId,
    },
  });

  return alerts;
};

export const upsertAlert = async ({
  workspaceId,
  teamId,
  type,
  enabled,
  channel,
  settings,
}: UpsertAlert) => {
  const alert = await getPrisma(workspaceId).alert.findUnique({
    where: {
      teamId_type: {
        teamId,
        type,
      },
    },
  });

  if (!alert) {
    const newAlert = await getPrisma(workspaceId).alert.create({
      data: {
        workspaceId,
        teamId,
        type,
        channel,
        enabled: enabled ?? false,
        settings: isObject(settings) ? (settings as JsonObject) : {},
      },
    });

    return newAlert as unknown as Alert;
  }

  const updatedSettings = settings
    ? assign(alert.settings as object, settings)
    : alert.settings;

  const updatedAlert = await getPrisma(workspaceId).alert.update({
    where: {
      id: alert.id,
    },
    data: {
      enabled,
      channel,
      settings: updatedSettings as JsonObject,
    },
  });

  return updatedAlert as unknown as Alert;
};
