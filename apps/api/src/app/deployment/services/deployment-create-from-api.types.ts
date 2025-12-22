import { PostDeploymentInput } from "./deployment.validation";

export type HandleDeploymentTriggeredByApiArgs = Omit<
  PostDeploymentInput,
  "deployedAt"
> & {
  workspaceId: number;
  deployedAt: Date;
};
