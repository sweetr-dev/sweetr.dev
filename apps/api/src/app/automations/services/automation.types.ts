import {
  Automation as DbAutomation,
  AutomationType,
  Installation,
  Prisma,
  Subscription,
  Workspace,
} from "@prisma/client";

export type Automation = Omit<DbAutomation, "settings"> & {
  settings: AutomationSettings;
};

export interface FindAutomationByTypeArgs<T extends AutomationType> {
  workspaceId: number;
  type: T;
}

export interface UpsertAutomationArgs {
  workspaceId: number;
  type: AutomationType;
  enabled?: boolean;
  settings?: object;
}

export interface GetAutomationDataArgs {
  gitInstallationId: number;
  type: AutomationType;
}

export interface CanRunAutomationArgs {
  automation: Pick<Automation, "enabled">;
  workspace: Workspace & {
    subscription: Subscription | null;
    installation: Installation | null;
  };
  requiredScopes: Record<string, string>[];
}

export type AutomationTypeMap = {
  [AutomationType.PR_TITLE_CHECK]: AutomationPrTitleCheck;
  [AutomationType.PR_SIZE_LABELER]: AutomationPrSizeLabeler;
  [AutomationType.INCIDENT_DETECTION]: AutomationIncidentDetection;
};

export interface AutomationPrTitleCheck extends Omit<Automation, "settings"> {
  type: typeof AutomationType.PR_TITLE_CHECK;
  settings: PrTitleCheckSettings;
}

export interface AutomationPrSizeLabeler extends Omit<Automation, "settings"> {
  type: typeof AutomationType.PR_SIZE_LABELER;
  settings: PrSizeLabelerSettings;
}

export type AutomationSettings =
  | AutomationPrTitleCheck
  | AutomationPrSizeLabeler
  | AutomationIncidentDetection;

export interface PrTitleCheckSettings extends Prisma.JsonObject {
  regex?: string;
  regexExample?: string;
}

export interface AutomationIncidentDetection
  extends Omit<Automation, "settings"> {
  type: typeof AutomationType.INCIDENT_DETECTION;
  settings: IncidentDetectionSettings;
}

export interface IncidentDetectionSettings {
  revert?: {
    enabled?: boolean;
  };
  hotfix?: {
    enabled?: boolean;
    prTitleRegEx?: string;
    branchRegEx?: string;
    prLabelRegEx?: string;
  };
  rollback?: {
    enabled?: boolean;
  };
}

export interface PrSizeLabelerSettings {
  repositories?: string[];
  labels?: {
    huge?: {
      label: string;
      color: string;
    };
    large?: {
      label: string;
      color: string;
    };
    medium?: {
      label: string;
      color: string;
    };
    small?: {
      label: string;
      color: string;
    };
    tiny?: {
      label: string;
      color: string;
    };
  };
}
