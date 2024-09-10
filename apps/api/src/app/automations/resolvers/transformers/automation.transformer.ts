import { Automation as DbAutomation } from "@prisma/client";
import {
  Automation as ApiAutomation,
  AutomationType,
} from "@sweetr/graphql-types/dist/api";

export const transformAutomation = (
  automation: DbAutomation
): ApiAutomation => {
  return {
    ...automation,
    enabled: automation.enabled || false,
    type: automation.type as AutomationType,
    settings: automation.settings as object,
  };
};
