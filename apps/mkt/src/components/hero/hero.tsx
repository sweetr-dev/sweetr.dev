import { IconBook, IconBrandGithub } from "@tabler/icons-react";
import {
  createStyles,
  Container,
  Text,
  Button,
  Title,
  rem,
  Box,
  Group,
} from "@mantine/core";
import { FC } from "react";
import { Lexend } from "next/font/google";

const lexendFont = Lexend({ subsets: ["latin"] });

const useStyles = createStyles((theme) => ({
  wrapper: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
    backgroundImage: `radial-gradient(circle farthest-corner at 50% 0%, hsla(116, 100%, 50%, 0.13), hsla(0, 0%, 100%, 0) 43%), radial-gradient(circle farthest-corner at 50% 0%, hsla(135.268, 100%, 43.92%, 0.08), hsla(0, 0%, 100%, 0) 66%), linear-gradient(to bottom, hsla(0, 0%, 0%, 0.4) 29%, hsla(220, 8.57%, 6.86%, 1)), url('/pattern.png')`,
    backgroundSize: "auto, auto, auto, 540px",
    minHeight: "100vh",
  },

  inner: {
    position: "relative",
    paddingTop: rem(250),
    paddingBottom: rem(80),

    [theme.fn.smallerThan("sm")]: {
      paddingBottom: rem(80),
    },
  },
  titleBg: {
    backgroundColor: "hsla(135.268, 100%, 43.92%, 1)",
    backgroundImage:
      "linear-gradient(207deg, hsla(135.268, 100%, 43.92%, 1) 10%, hsla(161, 88.48%, 52.35%, 0.45) 50%, hsla(53, 98.41%, 50.59%, 1) 90%);",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  title: {
    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(42),
      lineHeight: 1.2,
    },
  },
  subtitle: {
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
  },
  button: {
    borderColor: "00e039",
    paddingLeft: rem(20),
    paddingRight: rem(20),
    backgroundColor: "#111217",

    [theme.fn.smallerThan("sm")]: {
      paddingLeft: rem(18),
      paddingRight: rem(18),
      flex: 1,
    },
  },
}));

export const Hero: FC = () => {
  const { classes } = useStyles();

  return (
    <div className={classes.wrapper}>
      <Container ta="center">
        <Box className={classes.inner}>
          <Box mt="lg" className={classes.titleBg}>
            <Title
              fz={68}
              color="dimmed"
              fw="bold"
              lh={1}
              className={classes.title}
              order={1}
            >
              Speed up your team&apos;s <br />
              development workflow
            </Title>
          </Box>
          <Title
            mt="md"
            fz={18}
            order={1}
            fw={600}
            className={classes.subtitle}
            lh={1}
          >
            <Text component="span" className={lexendFont.className}>
              Automations to make Pull Requests easier to review and merge
            </Text>
          </Title>

          <Group mt={80} position="center">
            <Button
              component="a"
              href="https://docs.sweetr.dev/"
              size="lg"
              variant="default"
              color="gray.1"
              className={classes.button}
              leftIcon={<IconBook size={20} />}
            >
              Read Docs
            </Button>
            <Button
              component="a"
              href="https://github.com/apps/sweetr-dev/installations/new"
              size="lg"
              variant="default"
              color="gray.1"
              className={classes.button}
              leftIcon={<IconBrandGithub size={20} />}
            >
              Install on GitHub
            </Button>
          </Group>
        </Box>
      </Container>
    </div>
  );
};
