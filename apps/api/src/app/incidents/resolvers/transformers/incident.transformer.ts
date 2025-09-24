import { Incident as DatabaseIncident } from "@prisma/client";
import { Incident as ApiIncident } from "../../../../graphql-types";

export const transformIncident = (
  incident: DatabaseIncident
): Omit<
  ApiIncident,
  "causeDeployment" | "fixDeployment" | "team" | "leader"
> => {
  return {
    ...incident,
    detectedAt: incident.detectedAt?.toISOString(),
    resolvedAt: incident.resolvedAt?.toISOString(),
    archivedAt: incident.archivedAt?.toISOString(),
  };
};
