import { useMediaQuery } from "@mantine/hooks";
import { useMantineTheme } from "@mantine/core";

export const useScreenSize = () => {
  const theme = useMantineTheme();

  return {
    isSmallScreen: useMediaQuery(`(max-width: ${theme.breakpoints.sm})`),
  };
};
