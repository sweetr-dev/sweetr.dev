import { useLocation } from "react-router-dom";
import {
  AppShell,
  AppShellSection,
  Stack,
  useMantineTheme,
} from "@mantine/core";
import Logo from "../../../assets/logo.svg";
import { NavbarItem } from "./navbar-item";
import { NavbarUser } from "./navbar-user";
import { useMediaQuery } from "@mantine/hooks";
import { navItems } from "../../../providers/nav.provider";

interface NavbarProps {
  onNavigate: () => void;
}

export const NavbarMain = ({ onNavigate }: NavbarProps) => {
  const { pathname } = useLocation();
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <AppShell.Navbar p="md">
      <AppShellSection grow>
        <Stack
          justify="center"
          align={isSmallScreen ? "flex-end" : "center"}
          gap={4}
        >
          <img
            src={Logo}
            alt="sweetr.dev"
            height={32}
            width={32}
            style={{ marginBottom: 50 }}
          />
          {navItems.map((link) => (
            <NavbarItem
              {...link}
              active={
                pathname === link.href ||
                (link.href != "/" && pathname.startsWith(link.href || ""))
              }
              key={link.label}
              onClick={() => onNavigate()}
            />
          ))}
        </Stack>
      </AppShellSection>
      <AppShellSection>
        <NavbarUser onNavigate={() => onNavigate()} />
      </AppShellSection>
    </AppShell.Navbar>
  );
};
