import {
  Installation,
  Subscription,
  Workspace,
  Alert as DbAlert,
  AlertType,
  Prisma,
  Team,
} from "@prisma/client";

export type Alert = Omit<DbAlert, "settings"> & {
  settings: AlertSettings;
};

export type AlertWithTeam<T extends AlertType> = AlertTypeMap[T] & {
  team: Team;
};

export interface FindActiveAlerts<T extends AlertType> {
  workspaceId: number;
  teamIds: number[];
  type: T;
}

export interface FindAlertByTypeArgs<T extends AlertType> {
  workspaceId: number;
  teamId: number;
  type: T;
}

export interface UpsertAlert {
  workspaceId: number;
  teamId: number;
  type: AlertType;
  enabled: boolean;
  channel: string;
  settings: AlertSettings;
}

export interface CanSendAlertArgs {
  alert: Pick<Alert, "enabled">;
  workspace: Workspace & {
    subscription: Subscription | null;
    installation: Installation | null;
  };
}

export type AlertTypeMap = {
  [AlertType.SLOW_MERGE]: AlertSlowMerge;
  [AlertType.SLOW_REVIEW]: AlertSlowReview;
  [AlertType.MERGED_WITHOUT_APPROVAL]: AlertMergedWithoutApproval;
  [AlertType.HOT_PR]: AlertHotPr;
  [AlertType.UNRELEASED_CHANGES]: AlertUnreleasedChanges;
};

export interface AlertSlowMerge extends Omit<Alert, "settings"> {
  type: typeof AlertType.SLOW_MERGE;
  settings: Prisma.JsonObject;
}

export interface AlertSlowReview extends Omit<Alert, "settings"> {
  type: typeof AlertType.SLOW_REVIEW;
  settings: Prisma.JsonObject;
}

export interface AlertMergedWithoutApproval extends Omit<Alert, "settings"> {
  type: typeof AlertType.MERGED_WITHOUT_APPROVAL;
  settings: Prisma.JsonObject;
}

export interface AlertHotPr extends Omit<Alert, "settings"> {
  type: typeof AlertType.HOT_PR;
  settings: Prisma.JsonObject;
}

export interface AlertUnreleasedChanges extends Omit<Alert, "settings"> {
  type: typeof AlertType.UNRELEASED_CHANGES;
  settings: Prisma.JsonObject;
}

export type AlertSettings = Prisma.JsonObject;
