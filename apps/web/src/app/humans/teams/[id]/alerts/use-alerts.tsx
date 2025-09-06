import { Alert, AlertType } from "@sweetr/graphql-types/frontend/graphql";
import { objectify } from "radash";
import { useWorkspace } from "../../../../../providers/workspace.provider";
import { useTeamAlertsQuery } from "../../../../../api/alert.api";

interface UseAlerts {
  alerts: Record<AlertType, Alert> | undefined;
  isLoading: boolean;
}

interface UseAlertsProps {
  teamId: string;
}

export const useAlerts = ({ teamId }: UseAlertsProps): UseAlerts => {
  const { workspace } = useWorkspace();

  const { data, isLoading } = useTeamAlertsQuery({
    workspaceId: workspace.id,
    teamId,
  });

  const alerts: Record<AlertType, Alert> | undefined = objectify(
    data?.workspace.team?.alerts || [],
    (i) => i.type,
  );

  return {
    alerts,
    isLoading,
  };
};
