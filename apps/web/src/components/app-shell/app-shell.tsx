import { AppShell as MantineAppShell, useMantineTheme } from "@mantine/core";
import { Header } from "./header";
import { Navbar } from "../navbar";
import { useDisclosure } from "@mantine/hooks";
import { useNavStore } from "../../providers/nav.provider";
import { useScreenSize } from "../../providers/screen.provider";

interface Props {
  children: React.ReactNode;
  topOffset?: number;
}

export const AppShell = ({ children, topOffset = 0 }: Props) => {
  const theme = useMantineTheme();
  const { isSmallScreen } = useScreenSize();
  const [isMobileNavOpen, handlers] = useDisclosure(false);
  const { hasSubnav } = useNavStore();

  return (
    <MantineAppShell
      styles={{
        main: {
          background: theme.colors.dark[8],
          overflowX: "auto",
          ...(topOffset > 0 && {
            paddingTop: `calc(var(--app-shell-header-height) + ${topOffset}px)`,
          }),
        },
        header: {
          ...(topOffset > 0 && { top: topOffset }),
        },
        navbar: {
          ...(topOffset > 0 && {
            top: topOffset,
            height: `calc(100% - ${topOffset}px)`,
          }),
        },
      }}
      layout={isSmallScreen ? "default" : "alt"}
      navbar={{
        width: hasSubnav ? 330 : 91,
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
