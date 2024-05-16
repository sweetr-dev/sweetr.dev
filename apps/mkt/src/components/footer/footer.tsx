import Logo from "../../assets/logo.svg";
import Image from "next/image";
import {
  createStyles,
  Container,
  Group,
  ActionIcon,
  rem,
  Anchor,
} from "@mantine/core";
import { IconBrandGithub, IconMail, IconRecordMail } from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
  footer: {
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },

  inner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
}));

export function Footer() {
  const { classes } = useStyles();

  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <Image alt="Logo" src={Logo} width={28} height={28} />
        <Group position="center" align="center" noWrap mt={0}>
          <Anchor
            color="dimmed"
            fz="sm"
            href="https://docs.sweetr.dev/"
            target="_blank"
          >
            Docs
          </Anchor>
          <Anchor
            color="dimmed"
            fz="sm"
            href="https://github.com/orgs/sweetr-dev/projects/1"
            target="_blank"
          >
            Roadmap
          </Anchor>
          <Anchor color="dimmed" fz="sm" href="/privacy-policy" target="_blank">
            Privacy Policy
          </Anchor>
          <ActionIcon
            size="lg"
            component="a"
            href="https://github.com/sweetr-dev"
            target="_blank"
            rel="nofollow"
          >
            <IconBrandGithub size="1.05rem" stroke={1.5} />
          </ActionIcon>
        </Group>
      </Container>
    </div>
  );
}
