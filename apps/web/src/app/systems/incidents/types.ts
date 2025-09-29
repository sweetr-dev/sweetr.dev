import { UTCDate } from "@date-fns/utc";
import { z } from "zod";

export const IncidentForm = z
  .object({
    incidentId: z.string().nonempty("Field is empty").optional().nullable(),
    applicationId: z.string().nonempty("Field is empty"),
    workspaceId: z.string().nonempty("Field is empty"),
    teamId: z.string().optional(),
    leaderId: z.string().optional(),
    detectedAt: z.string().nonempty("Field is empty"),
    resolvedAt: z.string().optional().nullable(),
    causeDeploymentId: z.string().nonempty("Field is empty"),
    fixDeploymentId: z.string().optional().nullable(),
    postmortemUrl: z.string().url().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.resolvedAt && data.detectedAt) {
        return new UTCDate(data.resolvedAt) >= new UTCDate(data.detectedAt);
      }

      return true;
    },
    {
      message: "Resolved date must be after detected date",
      path: ["resolvedAt"],
    },
  );

export type IncidentForm = z.infer<typeof IncidentForm>;
