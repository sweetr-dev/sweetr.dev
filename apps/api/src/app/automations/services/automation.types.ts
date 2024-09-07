import { AutomationSlug } from "@sweetr/graphql-types/dist/api";

export interface FindAutomationBySlug {
  workspaceId: number;
  slug: AutomationSlug;
}
