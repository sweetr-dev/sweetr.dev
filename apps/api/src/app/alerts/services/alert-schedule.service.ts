import { AlertType } from "@prisma/client";
import { getBypassRlsPrisma } from "../../../prisma";
import { isActiveCustomer } from "../../authorization.service";
import { AlertWithRelations } from "./alert.types";

export const findScheduledAlerts = async (types: AlertType[]) => {
  const alerts = await getBypassRlsPrisma().alert.findMany({
    where: {
      enabled: true,
      type: {
        in: types,
      },
    },
    include: {
      team: true,
      workspace: {
        include: {
          subscription: true,
          installation: true,
        },
      },
    },
  });

  const sendableAlerts = alerts.filter(canSendAlert);

  return sendableAlerts as AlertWithRelations<AlertType>[];
};

export const canSendAlert = (alert: AlertWithRelations<AlertType>): boolean => {
  if (!isActiveCustomer(alert.workspace)) return false;

  if (!alert.workspace.installation) return false;

  return true;
};
