import {
  createStyles,
  Header,
  Container,
  Group,
  Button,
  Text,
} from "@mantine/core";
import Logo from "../../assets/logo.svg";
import Image from "next/image";
import { IconBrandGithub, IconDoorEnter } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Lexend } from "next/font/google";

const lexendFont = Lexend({ subsets: ["latin"] });
const useStyles = createStyles((theme) => ({
  header: {
    position: "fixed",
    transition: "all 200ms ease-in-out",
    transform: "translateY(-60px)",
  },

  nav: {
    transition: "all 200ms ease-in-out",
    position: "fixed",
    background: "rgba(16,17,20,0.5)",
    backdropFilter: "blur(10px)",
  },

  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
  },

  logoName: {
    ...lexendFont.style,
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },
}));

export function Nav() {
  const { classes } = useStyles();

  return (
    <Header height={60} className={classes.nav}>
      <Container className={classes.headerContainer}>
        <Group spacing="xs">
          <Image alt="Logo" src={Logo} width={28} height={28} />
          <Text component="span" className={classes.logoName} color="white">
            sweetr.dev
          </Text>
        </Group>
        <Group spacing={5}>
          <Button
            component="a"
            href="https://github.com/apps/sweetr-dev/installations/new"
            variant="light"
            color="gray"
            leftIcon={<IconBrandGithub size={20} />}
          >
            Install on GitHub
          </Button>

          <Button
            component="a"
            href="https://app.sweetr.dev"
            variant="light"
            color="gray"
            leftIcon={<IconDoorEnter size={20} />}
          >
            Login
          </Button>
        </Group>
      </Container>
    </Header>
  );
}
