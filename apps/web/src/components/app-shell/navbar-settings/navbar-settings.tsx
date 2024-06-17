import {
  AppShell,
  AppShellSection,
  Divider,
  NavLink,
  Stack,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconArrowLeft,
  IconCash,
  IconForms,
  IconUser,
} from "@tabler/icons-react";
import classes from "./navbar-item.module.css";
import { Link } from "react-router-dom";
import Logo from "../../../assets/logo.svg";

interface NavbarProps {
  onNavigate: () => void;
}

export const NavbarSettings = ({ onNavigate }: NavbarProps) => {
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <AppShell.Navbar>
      <AppShellSection grow>
        <Stack
          style={{
            borderBottom: "1px solid var(--_app-shell-border-color)",
            height: 60,
          }}
          align="center"
          justify="center"
        >
          <img src={Logo} alt="sweetr.dev" height={32} width={32} style={{}} />
        </Stack>
        <Stack gap={4} p="md">
          <Divider label="Settings" labelPosition="left" fw="bold" />
          <NavLink
            to="#a"
            component={Link}
            className={classes.item}
            label="Org Details"
            leftSection={<IconForms size={16} stroke={1.5} />}
          />
          <NavLink
            to="#b"
            component={Link}
            className={classes.item}
            label="Billing"
            leftSection={<IconCash size={16} stroke={1.5} />}
          />
          <Divider label="Personal" labelPosition="left" mt="md" fw="bold" />
          <NavLink
            to="#c"
            component={Link}
            className={classes.item}
            label="My account"
            leftSection={<IconUser size={16} stroke={1.5} />}
          />
        </Stack>
      </AppShellSection>
      <AppShellSection>
        <NavLink
          to="/"
          component={Link}
          label="Return"
          leftSection={<IconArrowLeft size="1rem" stroke={1.5} />}
        />
      </AppShellSection>
    </AppShell.Navbar>
  );
};
