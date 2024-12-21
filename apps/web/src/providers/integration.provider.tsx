import {
  Integration,
  IntegrationApp,
} from "@sweetr/graphql-types/frontend/graphql";
import { useIntegrationsQuery } from "../api/integrations.api";
import { useWorkspace } from "./workspace.provider";
import { isEmpty, objectify } from "radash";

export const useIntegrations = () => {
  const { workspace } = useWorkspace();

  const { data, ...query } = useIntegrationsQuery({
    workspaceId: workspace.id,
  });

  const integrations: Record<IntegrationApp, Integration> | undefined =
    objectify(data?.workspace.integrations || [], (i) => i.app);

  return {
    integrations: isEmpty(integrations) ? undefined : integrations,
    query,
  };
};

const messagingApps = [IntegrationApp.SLACK];

export const useMessagingIntegration = () => {
  const { integrations, query } = useIntegrations();

  if (!integrations) return { integration: undefined, query };

  return {
    integration: Object.values(integrations).find(
      (i) => messagingApps.includes(i.app) && i.isEnabled,
    ),
    query,
  };
};
