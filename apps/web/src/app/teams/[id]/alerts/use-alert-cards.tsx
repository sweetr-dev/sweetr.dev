import { AlertType } from "@sweetr/graphql-types/frontend/graphql";
import {
  IconEyeCode,
  IconEyeOff,
  IconGitMerge,
  IconMessage2Exclamation,
  IconRocketOff,
  TablerIconsProps,
} from "@tabler/icons-react";
import { fork } from "radash";

interface AlertCardData {
  type: AlertType;
  available: boolean;
  title: string;
  description: string;
  icon: React.ComponentType<TablerIconsProps>;
  getRoute: (teamId: string) => string;
}

const alertCards: Record<AlertType, AlertCardData> = {
  [AlertType.SLOW_REVIEW]: {
    available: true,
    type: AlertType.SLOW_REVIEW,
    title: "Slow review",
    description:
      "Alert when an open Pull Request has been waiting for review for too long.",
    icon: IconGitMerge,
    getRoute: (teamId) => `/teams/${teamId}/alerts/slow-review`,
  },
  [AlertType.SLOW_MERGE]: {
    available: true,
    type: AlertType.SLOW_MERGE,
    title: "Slow merge",
    description:
      "Alert when an approved Pull Request has been waiting for merge for too long.",
    icon: IconEyeCode,
    getRoute: (teamId) => `/teams/${teamId}/alerts/slow-merge`,
  },
  [AlertType.MERGED_WITHOUT_APPROVAL]: {
    available: true,
    type: AlertType.MERGED_WITHOUT_APPROVAL,

    title: "Merged without approval",
    description: "Alert when a Pull Request is merged without approvals.",
    icon: IconEyeOff,
    getRoute: (teamId) => `/teams/${teamId}/alerts/merged-without-approval`,
  },
  [AlertType.HOT_PR]: {
    available: false,
    type: AlertType.HOT_PR,

    title: "Hot Pull Request",
    description:
      "Alert when a Pull Request has lot of comments or back-and-forth.",
    icon: IconMessage2Exclamation,
    getRoute: (teamId) => `/teams/${teamId}/alerts/hot-pr`,
  },
  [AlertType.UNRELEASED_CHANGES]: {
    available: false,
    type: AlertType.UNRELEASED_CHANGES,

    title: "Too many unreleased changes",
    description: "Alert when many merged Pull Requests are pending release.",
    icon: IconRocketOff,
    getRoute: (teamId) => `/teams/${teamId}/alerts/unreleased-changes`,
  },
};

export type AlertCard = (typeof alertCards)[keyof typeof alertCards];

interface UseAlertCards {
  alertCards: typeof alertCards;
  availableAlerts: AlertCard[];
  futureAlerts: AlertCard[];
}

export const useAlertCards = (): UseAlertCards => {
  const [availableAlerts, futureAlerts] = fork(
    Object.values(alertCards),
    (AlertCard) => AlertCard.available,
  );

  return {
    alertCards,
    availableAlerts,
    futureAlerts,
  };
};
