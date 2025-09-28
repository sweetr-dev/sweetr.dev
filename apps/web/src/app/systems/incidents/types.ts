import { z } from "zod";

export const IncidentForm = z
  .object({
    incidentId: z.string().min(1).optional().nullable(),
    workspaceId: z.string().min(1),
    teamId: z.string().optional(),
    leaderId: z.string().optional(),
    detectedAt: z.string().min(1),
    resolvedAt: z.string().optional().nullable(),
    causeDeploymentId: z.string().min(1),
    fixDeploymentId: z.string().optional().nullable(),
    postmortemUrl: z.string().url().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.resolvedAt && data.detectedAt) {
        return data.resolvedAt >= data.detectedAt;
      }
      return true;
    },
    {
      message: "Resolved date must be after detected date",
      path: ["resolvedAt"],
    },
  );

export type IncidentForm = z.infer<typeof IncidentForm>;
