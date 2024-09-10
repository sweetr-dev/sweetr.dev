import { AutomationType } from "@prisma/client";

export interface FindAutomationByTypeArgs {
  workspaceId: number;
  type: AutomationType;
}

export interface UpsertAutomationArgs {
  workspaceId: number;
  type: AutomationType;
  enabled?: boolean;
  settings?: object;
}
