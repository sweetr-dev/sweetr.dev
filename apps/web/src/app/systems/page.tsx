import { Portal } from "@mantine/core";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SubnavSystems } from "./components/subnav-systems";

export const SystemsPage = () => {
  const { pathname } = useLocation();

  if (pathname === "/systems") {
    return <Navigate to="/systems/repositories" />;
  }

  return (
    <>
      <Portal target="#subnav">
        <SubnavSystems />
      </Portal>
      <Outlet />
    </>
  );
};
