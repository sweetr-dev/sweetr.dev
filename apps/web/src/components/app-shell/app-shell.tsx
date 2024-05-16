import { AppShell as MantineAppShell, useMantineTheme } from "@mantine/core";
import { Header } from "./header";
import { Navbar } from "../navbar";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

interface Props {
  children: React.ReactNode;
}

export const AppShell = ({ children }: Props) => {
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [isMobileNavOpen, handlers] = useDisclosure(false);

  return (
    <MantineAppShell
      styles={{
        main: {
          background: theme.colors.dark[8],
        },
      }}
      layout={isSmallScreen ? "default" : "alt"}
      navbar={{
        width: 80,
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
      <Navbar onNavigate={handlers.close} />
      <MantineAppShell.Main>{children}</MantineAppShell.Main>
    </MantineAppShell>
  );
};
