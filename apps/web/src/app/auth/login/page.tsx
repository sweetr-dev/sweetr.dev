import {
  Box,
  Button,
  Flex,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { AuthProvider } from "@sweetr/graphql-types/frontend/graphql";
import {
  IconBrandGithub,
  IconClock,
  IconFireExtinguisher,
  IconFlame,
  IconQuote,
} from "@tabler/icons-react";
import { useAuthProviderQuery } from "../../../api/auth.api";
import { Logo } from "../../../components/logo";
import { IconDeployment } from "../../../providers/icon.provider";
import { useSearchParams } from "react-router";
import Particles from "./particles";
import classes from "./page.module.css";

const ELITE_BENCHMARKS = [
  {
    icon: IconDeployment,
    metric: "Deployment Frequency",
    benchmark: "On-demand, multiple deploys per day",
  },
  {
    icon: IconClock,
    metric: "Lead Time for Changes",
    benchmark: "Less than one hour from commit to production",
  },
  {
    icon: IconFireExtinguisher,
    metric: "Time to Restore Service",
    benchmark: "Less than one hour to recover from incidents",
  },
  {
    icon: IconFlame,
    metric: "Change Failure Rate",
    benchmark: "0–15% of changes cause failures",
  },
];

export const LoginPage = () => {
  const [searchParams] = useSearchParams({
    redirectTo: "",
  });

  const { data, isLoading } = useAuthProviderQuery({
    input: {
      provider: AuthProvider.GITHUB,
      redirectTo: searchParams.get("redirectTo"),
    },
  });

  const { colorScheme } = useMantineColorScheme();

  document.body.style.backgroundColor = "#141517";

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
              <Title order={3}>Get started for free</Title>
              <Text size="sm" c="dimmed">
                No credit card required
              </Text>
            </Stack>
            <Button
              component="a"
              fullWidth
              size="md"
              w={280}
              href={data?.authProvider.redirectUrl}
              loading={isLoading}
              leftSection={<IconBrandGithub size={16} />}
              bg="green.4"
              loaderProps={{ color: "black" }}
              c="black"
            >
              Continue with GitHub
            </Button>
            <Text size="sm" c="dimmed" ta="center" maw={260} lh={1.5}>
              Works for login and signup. New teams will be guided through
              setup.
            </Text>
            <Text
              component="a"
              href="/sandbox"
              size="xs"
              c="dimmed"
              td="underline"
              style={{ textUnderlineOffset: 3 }}
            >
              Explore the sandbox instead.
            </Text>
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
            <Title order={2} lh={1.3}>
              Is your engineering team elite?
            </Title>
            <Text size="sm" c="dimmed" mt="xs" mb={36}>
              According to the DORA research program, elite teams hit all four
              of these benchmarks. Most teams don&apos;t know where they stand.
            </Text>

            <Stack gap="lg">
              {ELITE_BENCHMARKS.map((item) => (
                <Flex key={item.metric} gap="md" align="center">
                  <ThemeIcon
                    variant="default"
                    size={42}
                    radius="md"
                    style={{ flexShrink: 0 }}
                  >
                    <item.icon size={22} />
                  </ThemeIcon>
                  <Box style={{ minWidth: 0 }}>
                    <Text fw={600} size="md">
                      {item.metric}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {item.benchmark}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </Stack>

            <Text fw={500} size="sm" mt={36}>
              Sweetr tracks these metrics automatically from your Git data.
            </Text>

            <Flex align="center" gap={6} mt={36}>
              <IconQuote
                size={14}
                color="var(--mantine-color-dark-3)"
                style={{ flexShrink: 0 }}
              />
              <Text
                component="a"
                href="https://dora.dev/research/2021/dora-report/2021-dora-accelerate-state-of-devops-report.pdf"
                target="_blank"
                rel="noopener noreferrer"
                size="xs"
                c="dimmed"
                fs="italic"
                td="underline"
                style={{ textUnderlineOffset: 3 }}
              >
                Source: 2021 Accelerate State of DevOps Report (DORA / Google
                Cloud)
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Paper>
    </Flex>
  );
};
