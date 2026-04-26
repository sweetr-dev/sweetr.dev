import { Button, Flex, Paper, Stack, Text, Title } from "@mantine/core";
import { AuthProvider } from "@sweetr/graphql-types/frontend/graphql";
import { useAuthProviderQuery } from "../../../api/auth.api";
import { Logo } from "../../../components/logo";
import { Link, useSearchParams } from "react-router";
import { Particles } from "../components/particles";
import classes from "./page.module.css";

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
              <Title order={3}>Sweetr</Title>
              <Text size="sm" c="dimmed">
                Login or signup with GitHub
              </Text>
            </Stack>

            <Stack gap={10}>
              <Button
                component="a"
                fullWidth
                size="md"
                w={280}
                href={data?.authProvider.redirectUrl}
                loading={isLoading}
                bg="green.4"
                loaderProps={{ color: "black" }}
                c="black"
              >
                Login with GitHub
              </Button>
              <Button
                component={Link}
                fullWidth
                size="md"
                w={280}
                to="/sign-up"
                loading={isLoading}
                loaderProps={{ color: "black" }}
                variant="default"
              >
                Start 14-day free trial
              </Button>
            </Stack>

            <Text
              component="a"
              href="/sandbox"
              size="xs"
              c="dimmed"
              td="underline"
              style={{ textUnderlineOffset: 3 }}
            >
              Explore the sandbox instead
            </Text>
          </Stack>
        </Flex>
      </Paper>
    </Flex>
  );
};
