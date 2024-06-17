import { useLocation } from "react-router-dom";

export const useNavbar = () => {
  const { pathname } = useLocation();

  if (pathname.includes("/settings")) {
    return {
      isSettings: true,
      width: 200,
    };
  }

  return {
    isSettings: false,
    width: 80,
  };
};
