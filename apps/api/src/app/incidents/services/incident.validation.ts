import { z } from "zod";
import {
  deploymentValidator,
  teamValidator,
  workspaceMemberValidator,
} from "../../validator.service";
import { URL_INPUT_MAX_LENGTH } from "../../../lib/validate-input";

export const getIncidentValidationSchema = (workspaceId: number) =>
  z.object({
    workspaceId: z.number(),
    causeDeploymentId: deploymentValidator(workspaceId),
    detectedAt: z.date(),
    // Optional fields
    incidentId: z.number().optional(),
    fixDeploymentId: deploymentValidator(workspaceId).optional().nullable(),
    leaderId: workspaceMemberValidator(workspaceId).optional().nullable(),
    teamId: teamValidator(workspaceId).optional().nullable(),
    postmortemUrl: z.string().max(URL_INPUT_MAX_LENGTH).optional().nullable(),
    resolvedAt: z.date().optional().nullable(),
  });
