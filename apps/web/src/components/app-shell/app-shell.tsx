import { AppShell as MantineAppShell, useMantineTheme } from "@mantine/core";
import { Header } from "./header";
import { Navbar } from "../navbar";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useNavStore } from "../../providers/nav.provider";

interface Props {
  children: React.ReactNode;
}

export const AppShell = ({ children }: Props) => {
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [isMobileNavOpen, handlers] = useDisclosure(false);
  const { hasSubnav } = useNavStore();

  return (
    <MantineAppShell
      styles={{
        main: {
          background: theme.colors.dark[8],
        },
      }}
      layout={isSmallScreen ? "default" : "alt"}
      navbar={{
        width: hasSubnav ? 330 : 80,
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
      <Navbar closeMobileNav={handlers.close} />
      <MantineAppShell.Main>{children}</MantineAppShell.Main>
    </MantineAppShell>
  );
};
