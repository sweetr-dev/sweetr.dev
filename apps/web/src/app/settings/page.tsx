import { Portal } from "@mantine/core";
import { Navigate, Outlet, useLocation } from "react-router";
import { SubnavSettings } from "./components/subnav-settings";

export const SettingsPage = () => {
  const { pathname } = useLocation();

  if (pathname === "/settings") {
    return <Navigate to="/settings/workspace" />;
  }

  return (
    <>
      <Portal target="#subnav">
        <SubnavSettings />
      </Portal>
      <Outlet />
    </>
  );
};
