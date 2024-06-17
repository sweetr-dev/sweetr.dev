import { AppShell as MantineAppShell, useMantineTheme } from "@mantine/core";
import { Header } from "./header";
import { NavbarMain } from "./navbar-main";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useNavbar } from "./use-navbar";
import { NavbarSettings } from "./navbar-settings";

interface Props {
  children: React.ReactNode;
}

export const AppShell = ({ children }: Props) => {
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [isMobileNavOpen, handlers] = useDisclosure(false);
  const { width, isSettings } = useNavbar();

  return (
    <MantineAppShell
      styles={{
        main: {
          background: theme.colors.dark[8],
        },
      }}
      layout={isSmallScreen ? "default" : "alt"}
      navbar={{
        width,
        breakpoint: "sm",
        collapsed: { desktop: false, mobile: !isMobileNavOpen },
      }}
      header={{ height: 60 }}
    >
      <Header
        isMobileNavOpen={isMobileNavOpen}
        onToggleMenu={handlers.toggle}
        isMobile={!!isSmallScreen}
      />
      {!isSettings && <NavbarMain onNavigate={handlers.close} />}
      {isSettings && <NavbarSettings onNavigate={handlers.close} />}
      <MantineAppShell.Main>{children}</MantineAppShell.Main>
    </MantineAppShell>
  );
};
