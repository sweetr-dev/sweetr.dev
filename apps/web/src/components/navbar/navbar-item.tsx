import { UnstyledButton, Text, Stack } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import classes from "./navbar-item.module.css";

export interface NavbarItemProps {
  icon: Icon;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

export const NavbarItem = ({
  icon: Icon,
  label,
  active,
  href,
  onClick,
}: NavbarItemProps) => {
  const button = (
    <UnstyledButton
      py="xs"
      className={`${classes.button} ${active ? classes.active : ""}`}
      w="80px"
      onClick={onClick}
    >
      <Stack gap={5} align="center">
        <Icon stroke={1.5} className={classes.icon} />
        <Text fz="sm" className={classes.label}>
          {label}
        </Text>
      </Stack>
    </UnstyledButton>
  );

  if (href) {
    return (
      <Link to={href} className={classes.link}>
        {button}
      </Link>
    );
  }

  return button;
};
