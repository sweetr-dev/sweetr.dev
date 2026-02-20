import { z } from "zod";

export const WorkspaceFeatureAdoption = z.object({
  lastDeploymentCreatedAt: z.string().datetime().optional(),
});

export type WorkspaceFeatureAdoption = z.infer<typeof WorkspaceFeatureAdoption>;

export interface UpdateWorkspaceFeaturesInput {
  workspaceId: number;
  features: WorkspaceFeatureAdoption;
}
