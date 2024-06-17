import { Tooltip, UnstyledButton } from "@mantine/core";
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
    <Tooltip
      label={label}
      position="right"
      transitionProps={{ duration: 0 }}
      onClick={onClick}
    >
      <UnstyledButton
        className={`${classes.button} ${active ? classes.active : ""}`}
      >
        <Icon stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
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
