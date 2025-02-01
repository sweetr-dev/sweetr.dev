import { Alert as ApiAlert, AlertType } from "../../../../graphql-types";
import { Alert } from "../../services/alert.types";

export const transformAlert = (alert: Alert): ApiAlert => {
  return {
    ...alert,
    enabled: alert.enabled || false,
    type: alert.type as AlertType,
    settings: alert.settings,
  };
};
