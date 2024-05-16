import { Outlet } from "react-router-dom";
import { AppShell } from "../components/app-shell";
import { AppSpotlight } from "../components/app-spotlight";
import { useAppStore } from "../providers/app.provider";

interface AppProps {
  children?: React.ReactElement;
}

export const AppPage = ({ children }: AppProps) => {
  const { workspace } = useAppStore();

  return (
    <>
      {workspace && <AppSpotlight workspaceId={workspace.id} />}
      <AppShell>{children ? children : <Outlet />}</AppShell>
    </>
  );
};
