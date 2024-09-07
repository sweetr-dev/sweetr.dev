import { AutomationSetting, Automation as DbAutomation } from "@prisma/client";
import {
  Automation as ApiAutomation,
  AutomationBenefits,
  AutomationScope,
  AutomationSlug,
} from "@sweetr/graphql-types/api";

export const transformAutomation = (
  automation: DbAutomation & { settings: AutomationSetting[] }
): ApiAutomation => {
  return {
    ...automation,
    enabled: automation.settings[0]?.enabled || false,
    benefits: automation.benefits as AutomationBenefits,
    overrides: [],
    demoUrl: automation.demoUrl,
    scope: "WORKSPACE" as AutomationScope,
    slug: automation.slug as AutomationSlug,
  };
};
