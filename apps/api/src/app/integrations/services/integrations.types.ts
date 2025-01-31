import { IntegrationApp } from "@prisma/client";
import { Integration } from "../../../graphql-types";

export interface IntegrationService {
  installIntegration: (workspaceId: number, code: string) => Promise<void>;
  removeIntegration: (workspaceId: number) => Promise<void>;
  getInstallUrl: () => string;
  getIntegration: (workspaceId: number) => Promise<Integration | null>;
}

export interface InstallIntegrationArgs {
  app: IntegrationApp;
  workspaceId: number;
  code: string;
  state?: string;
}

export interface RemoveIntegrationArgs {
  app: IntegrationApp;
  workspaceId: number;
}
