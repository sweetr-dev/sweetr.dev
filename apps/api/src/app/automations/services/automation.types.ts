import { Automation, AutomationType } from "@prisma/client";

export interface FindAutomationBySlugArgs {
  workspaceId: number;
  type: AutomationType;
}

export interface UpsertAutomationArgs {
  workspaceId: number;
  type: AutomationType;
  enabled: boolean;
  settings?: object;
}

export type AutomationData = Pick<Automation, "enabled" | "settings"> & {
  id?: number;
  available: boolean;
  type: AutomationType;
  title: string;
  description: string;
  shortDescription: string;
  demoUrl: string;
  docsUrl?: string;
  color: string;
  icon: string;
  benefits: {
    techDebt?: string;
    failureRate?: string;
    security?: string;
    cycleTime?: string;
    compliance?: string;
  };
};
