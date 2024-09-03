import { IntegrationApp, Workspace } from "@prisma/client";
import { Integration } from "@sweetr/graphql-types/api";

export interface IntegrationService {
  installIntegration: (
    workspace: Workspace,
    code: string,
    state?: string
  ) => void;
  getInstallUrl: () => string;
  getIntegration: (workspaceId: number) => Promise<Integration | null>;
}

export interface InstallIntegrationArgs {
  app: IntegrationApp;
  workspace: Workspace;
  code: string;
  state?: string;
}
