import { Outlet } from "react-router";
import { AppShell } from "../components/app-shell";
import { AppSpotlight } from "../components/app-spotlight";
import { useAppStore } from "../providers/app.provider";
import { usePaywall } from "../providers/billing.provider";
import { useSentry } from "../providers/sentry.provider";
import { useSandbox } from "../sandbox/sandbox-context";
import {
  SandboxBanner,
  SANDBOX_BANNER_HEIGHT,
} from "../sandbox/sandbox-banner";

interface AppProps {
  children?: React.ReactElement;
}

export const AppPage = ({ children }: AppProps) => {
  const { workspace } = useAppStore();
  const { isSandbox } = useSandbox();
  const { shouldShowPaywall, goToPaywall, showPaywallNotification } =
    usePaywall();
  useSentry();

  if (shouldShowPaywall && !isSandbox) {
    showPaywallNotification();
    goToPaywall();

    return <></>;
  }

  return (
    <>
      {isSandbox && <SandboxBanner />}
      {workspace && <AppSpotlight workspaceId={workspace.id} />}
      <AppShell key={workspace?.id} topOffset={isSandbox ? SANDBOX_BANNER_HEIGHT : 0}>
        {children ? children : <Outlet />}
      </AppShell>
    </>
  );
};
