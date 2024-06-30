import { useLocation } from "react-router-dom";
import { AppShell, AppShellSection, Box, Group, Stack } from "@mantine/core";
import Logo from "../../assets/logo.svg";
import { NavbarItem } from "./navbar-item";
import { NavbarUser } from "./navbar-user";
import { navItems, useNavStore } from "../../providers/nav.provider";
import { IconSettings } from "@tabler/icons-react";

interface NavbarProps {
  closeMobileNav: () => void;
}

export const Navbar = ({ closeMobileNav }: NavbarProps) => {
  const { pathname } = useLocation();
  const { hasSubnav } = useNavStore();

  return (
    <AppShell.Navbar bg="dark.8">
      <AppShellSection grow>
        <Group h={"100%"} gap={0}>
          <Stack
            h={"100%"}
            style={{
              borderRight: hasSubnav
                ? "1px solid var(--mantine-color-dark-4)"
                : "",
            }}
            gap={0}
          >
            <Stack
              gap={4}
              p="md"
              maw={80}
              style={{ flexGrow: 1 }}
              align="center"
            >
              <img
                src={Logo}
                alt="sweetr.dev"
                height={32}
                width={32}
                style={{ marginBottom: 24 }}
              />
              {navItems.map((link) => (
                <NavbarItem
                  {...link}
                  active={
                    pathname === link.href ||
                    (link.href != "/" && pathname.startsWith(link.href || ""))
                  }
                  key={link.label}
                  onClick={() => closeMobileNav()}
                />
              ))}
            </Stack>
            <Stack justify="center" align="center" p="md" maw={80}>
              <NavbarItem
                label="Settings"
                icon={IconSettings}
                active={pathname.includes("/settings")}
                href="/settings/workspace"
              />
              <NavbarUser onNavigate={() => closeMobileNav()} />
            </Stack>
          </Stack>
          <Box id="subnav" h="100%" style={{ flexGrow: 1 }}></Box>
        </Group>
      </AppShellSection>
    </AppShell.Navbar>
  );
};
