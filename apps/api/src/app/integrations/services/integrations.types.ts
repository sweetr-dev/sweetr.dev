import { IntegrationApp, Workspace } from "@prisma/client";
import { Integration } from "@sweetr/graphql-types/dist/api";

export interface IntegrationService {
  installIntegration: (workspace: Workspace, code: string) => Promise<void>;
  removeIntegration: (workspace: Workspace) => Promise<void>;
  getInstallUrl: () => string;
  getIntegration: (workspaceId: number) => Promise<Integration | null>;
}

export interface InstallIntegrationArgs {
  app: IntegrationApp;
  workspace: Workspace;
  code: string;
  state?: string;
}

export interface RemoveIntegrationArgs {
  app: IntegrationApp;
  workspace: Workspace;
}
