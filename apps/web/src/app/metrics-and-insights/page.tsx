import { Portal } from "@mantine/core";
import { Navigate, Outlet, useLocation } from "react-router";
import { SubnavMetrics } from "./components/subnav-metrics";

export const MetricsAndInsightsPage = () => {
  const { pathname } = useLocation();

  if (pathname === "/metrics-and-insights") {
    return <Navigate replace to="/metrics-and-insights/dora" />;
  }

  return (
    <>
      <Portal target="#subnav">
        <SubnavMetrics />
      </Portal>

      <Outlet />
    </>
  );
};
