import {
  Button,
  Divider,
  Flex,
  Paper,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { AuthProvider } from "@sweetr/graphql-types/frontend/graphql";
import { IconBrandGithub } from "@tabler/icons-react";
import { useAuthProviderQuery } from "../../../api/auth.api";
import { Logo } from "../../../components/logo";
import { useSearchParams } from "react-router-dom";

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
    <Flex mih="100vh" align="center" direction="column">
      <Stack mt={120} align="center">
        <Logo size={128} />
        <Paper withBorder mt={40} p="lg" w={260}>
          <Title ta="center" order={5}>
            Choose a provider:
          </Title>
          <Divider my="md" />
          <Button
            component="a"
            fullWidth
            size="md"
            href={data?.authProvider.redirectUrl}
            loading={isLoading}
            leftSection={<IconBrandGithub size={16} />}
            style={(theme) => ({
              backgroundColor:
                theme.colors.dark[colorScheme === "dark" ? 9 : 6],
              color: "#fff",
              "&:hover": {
                backgroundColor:
                  theme.colors.dark[colorScheme === "dark" ? 9 : 6],
              },
            })}
          >
            Login with GitHub
          </Button>
        </Paper>

        <Text mt="xs" size="xs" c="dimmed">
          GitLab & BitBucket coming soon.
        </Text>
      </Stack>
    </Flex>
  );
};
