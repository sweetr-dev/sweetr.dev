import { AutomationSlug } from "@sweetr/graphql-types/api";

export interface FindAutomationBySlug {
  workspaceId: number;
  slug: AutomationSlug;
}
