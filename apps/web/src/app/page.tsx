import { Outlet } from "react-router-dom";
import { AppShell } from "../components/app-shell";
import { AppSpotlight } from "../components/app-spotlight";
import { useAppStore } from "../providers/app.provider";
import { usePaywall } from "../providers/billing.provider";

interface AppProps {
  children?: React.ReactElement;
}

export const AppPage = ({ children }: AppProps) => {
  const { workspace } = useAppStore();
  const { shouldShowPaywall, goToPaywall, showPaywallNotification } =
    usePaywall();

  if (shouldShowPaywall) {
    showPaywallNotification();
    return goToPaywall();
  }

  return (
    <>
      {workspace && <AppSpotlight workspaceId={workspace.id} />}
      <AppShell key={workspace?.id}>
        {children ? children : <Outlet />}
      </AppShell>
    </>
  );
};
