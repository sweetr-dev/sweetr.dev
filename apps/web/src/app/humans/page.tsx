import { Portal } from "@mantine/core";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SubnavHumans } from "./components/subnav-humans";

export const HumansPage = () => {
  const { pathname } = useLocation();

  if (pathname === "/humans") {
    return <Navigate to="/humans/teams" />;
  }

  const pagesWithSubNav = ["/humans/teams", "/humans/people"];

  return (
    <>
      {pagesWithSubNav.includes(pathname) && (
        <Portal target="#subnav">
          <SubnavHumans />
        </Portal>
      )}
      <Outlet />
    </>
  );
};
