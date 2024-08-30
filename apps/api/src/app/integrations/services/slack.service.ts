import { IntegrationApp } from "@sweetr/graphql-types/api";

export const getSlackIntegration = (workspaceId: number) => {
  return {
    app: IntegrationApp.SLACK,
    isEnabled: false,
    installUrl: getSlackInstallUrl(),
    enabledAt: new Date().toISOString(),
    target: "Invoice Simple",
  };
};

const getSlackInstallUrl = () => {
  return "https://google.com";
};
