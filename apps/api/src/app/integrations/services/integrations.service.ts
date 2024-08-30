import { getSlackIntegration } from "./slack.service";

export const getWorkspaceIntegrations = (workspaceId: number) => {
  return [getSlackIntegration(workspaceId)];
};
