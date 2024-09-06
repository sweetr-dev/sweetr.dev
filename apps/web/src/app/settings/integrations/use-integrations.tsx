import {
  Integration,
  IntegrationApp,
} from "@sweetr/graphql-types/frontend/graphql";
import { useIntegrationsQuery } from "../../../api/integrations.api";
import { useWorkspace } from "../../../providers/workspace.provider";
import { isEmpty, objectify } from "radash";

interface UseIntegrations {
  integrations: Record<IntegrationApp, Integration> | undefined;
  isLoading: boolean;
}

export const useIntegrations = (): UseIntegrations => {
  const { workspace } = useWorkspace();

  const { data, isLoading } = useIntegrationsQuery({
    workspaceId: workspace.id,
  });

  const integrations: Record<IntegrationApp, Integration> | undefined =
    objectify(data?.workspace.integrations || [], (i) => i.app);

  return {
    integrations: isEmpty(integrations) ? undefined : integrations,
    isLoading,
  };
};
