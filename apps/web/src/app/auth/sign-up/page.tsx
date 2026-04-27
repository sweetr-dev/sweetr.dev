import {
  Accordion,
  Anchor,
  Box,
  Button,
  Divider,
  Flex,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconBrandGithub,
  IconCode,
  IconLock,
  IconLogout,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Logo } from "../../../components/logo";
import { Link } from "react-router";
import { Particles } from "../components/particles";
import classes from "./page.module.css";
import { useNewInstallationUrlQuery } from "../../../api/auth.api";
import { AuthProvider } from "@sweetr/graphql-types/frontend/graphql";

const FAQ_ITEMS = [
  {
    value: "source-code",
    icon: IconCode,
    color: "green",
    question: "Does the GitHub app have access to my source code?",
    answer: (
      <>
        No. Sweetr only asks for access to metadata about organization members
        and their pull requests. You can check the{" "}
        <Anchor
          href="https://docs.sweetr.dev/about/data-privacy-and-security"
          target="_blank"
        >
          documentation
        </Anchor>{" "}
        for more details.
      </>
    ),
  },
  {
    value: "permissions",
    icon: IconLock,
    color: "blue",
    question: "Who has permissions to see the data?",
    answer:
      "Sweetr inherits the exact permissions your team already has on GitHub. If a teammate can't see a private repository on GitHub, they won't see any of its data on Sweetr either.",
  },
  {
    value: "security",
    icon: IconShieldCheck,
    color: "violet",
    question: "Is my data secure?",
    answer: (
      <>
        We follow stringent security best practices to protect our servers and
        your data.{" "}
        <Anchor
          href="https://docs.sweetr.dev/about/data-privacy-and-security"
          target="_blank"
        >
          Learn more
        </Anchor>
        .
      </>
    ),
  },
  {
    value: "uninstall",
    icon: IconLogout,
    color: "red",
    question: "Can I uninstall it at any time?",
    answer:
      "Yes. You can uninstall the GitHub app from your organization settings at any time and revoke access in a single click to remove all data from our servers. No questions asked.",
  },
];

export const SignUpPage = () => {
  document.body.style.backgroundColor = "#141517";

  const { data, isLoading } = useNewInstallationUrlQuery({
    input: {
      provider: AuthProvider.GITHUB,
    },
  });

  return (
    <Flex align="center" justify="center" p="xl" className={classes.page}>
      <Particles
        className={classes.particles}
        quantity={100}
        rgb="64, 192, 87"
      />
      <Paper
        withBorder
        bg="var(--mantine-color-dark-8)"
        radius="lg"
        p={48}
        maw={960}
        w="100%"
        pos="relative"
        style={{ zIndex: 1 }}
      >
        <Flex gap={60} align="center" justify="center">
          <Stack
            align="center"
            gap="xl"
            miw={{ base: 0, md: 300 }}
            style={{ flexShrink: 0 }}
          >
            <Logo size={96} />
            <Stack gap={5} align="center">
              <Title order={3}>Start 14-day free trial</Title>
              <Text size="sm" c="dimmed">
                No credit card required
              </Text>
            </Stack>
            <Button
              component="a"
              fullWidth
              size="md"
              w={280}
              loading={isLoading}
              href={data?.newInstallationUrl}
              leftSection={<IconBrandGithub size={16} />}
              bg="green.4"
              loaderProps={{ color: "black" }}
              c="black"
            >
              Install GitHub App
            </Button>
            <Anchor component={Link} to="/login" underline="hover" c="dimmed">
              Back to login
            </Anchor>
          </Stack>

          <Box
            pl={60}
            visibleFrom="md"
            style={{
              borderLeft: "1px solid var(--mantine-color-dark-4)",
              flex: 1,
              minWidth: 0,
            }}
          >
            <Title order={4} lh={1.3}>
              How it works
            </Title>
            <Text size="sm" c="dimmed" mt="xs" lh={1.6}>
              Sweetr is a GitHub app you install on your organization. Once
              installed, we sync your data automatically. You'll see your team's
              metrics within minutes, with zero configuration.
            </Text>

            <Divider my="xl" />

            <Title order={4} lh={1.3} mb="md">
              Common questions
            </Title>

            <Accordion
              variant="separated"
              radius="md"
              multiple
              styles={{
                item: {
                  backgroundColor: "var(--mantine-color-dark-7)",
                  border: "1px solid var(--mantine-color-dark-6)",
                },
              }}
            >
              {FAQ_ITEMS.map((item) => (
                <Accordion.Item key={item.value} value={item.value}>
                  <Accordion.Control
                    icon={
                      <ThemeIcon variant="light">
                        <item.icon size={20} stroke={2} />
                      </ThemeIcon>
                    }
                  >
                    <Text size="sm" fw={500}>
                      {item.question}
                    </Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Text size="sm" c="dimmed" lh={1.6}>
                      {item.answer}
                    </Text>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Box>
        </Flex>
      </Paper>
    </Flex>
  );
};
