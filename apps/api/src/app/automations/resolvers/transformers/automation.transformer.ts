import {
  Automation as ApiAutomation,
  AutomationType,
} from "../../../../graphql-types";
import { Automation } from "../../services/automation.types";

export const transformAutomation = (automation: Automation): ApiAutomation => {
  return {
    ...automation,
    enabled: automation.enabled || false,
    type: automation.type as AutomationType,
    settings: automation.settings,
  };
};
