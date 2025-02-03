import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { transformAlert } from "../transformers/alert.transformer";
import {
  findTeamAlertByType,
  findAlertsByTeam,
} from "../../services/alert.service";
import { Alert } from "../../services/alert.types";

export const teamAlertsQuery = createFieldResolver("Team", {
  alert: async (team, { input }, context) => {
    logger.info("query.team.alert", { team });

    if (!team.id) {
      throw new ResourceNotFoundException("Team not found");
    }

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const alert = await findTeamAlertByType({
      workspaceId: context.workspaceId,
      teamId: team.id,
      type: input.type,
    });

    if (!alert) return null;

    return transformAlert(alert as Alert);
  },
  alerts: async (team, _, context) => {
    logger.info("query.team.alerts", { team });

    if (!team.id) {
      throw new ResourceNotFoundException("Team not found");
    }

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const alerts = await findAlertsByTeam(context.workspaceId, team.id);

    return alerts.map(transformAlert);
  },
});
