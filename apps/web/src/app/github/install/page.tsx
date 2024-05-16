import {
  Group,
  Paper,
  Stepper,
  Title,
  Avatar,
  Button,
  Stack,
  Container,
  Box,
  rem,
} from "@mantine/core";
import { Confetti } from "./components/confetti";
import { IconBrandGithub, IconX } from "@tabler/icons-react";
import { Logo } from "../../../components/logo";
import { useGithubInstall } from "./use-github-install";
import { useNavigate } from "react-router-dom";
import { showInfoNotification } from "../../../providers/notification.provider";

const steps = [
  "Authenticating",
  "Create workspace",
  "Sync repositories",
  "Get started",
];

export const GithubInstallPage = () => {
  const { workspace, currentStep, errorAtStep } = useGithubInstall();
  const navigate = useNavigate();

  return (
    <Container mt={80}>
      <Box ta="center" mb={40}>
        <Logo size={40} />
      </Box>

      <Stepper
        active={currentStep}
        allowNextStepsSelect={false}
        mt="xl"
        radius="sm"
        color="green.6"
      >
        {steps.map((step, index) => (
          <Stepper.Step
            label={step}
            loading={currentStep === index && errorAtStep === null}
            key={step}
            color={errorAtStep === index ? "red" : undefined}
            icon={
              errorAtStep === index ? (
                <IconX
                  color="red"
                  style={{ width: rem(24), height: rem(24) }}
                />
              ) : undefined
            }
          >
            <Group gap="xs" justify="center" mt={60}>
              <IconBrandGithub size={32} stroke={0.5} />

              <Title order={1} size="h2" m={0}>
                Contacting GitHub...
              </Title>
            </Group>
          </Stepper.Step>
        ))}

        <Stepper.Completed>
          <Confetti />

          <Stack align="center">
            <Group gap="xs" justify="center" mt={60}>
              <IconBrandGithub size={32} stroke={0.5} />

              <Title order={1} size="h2" m={0}>
                App installed
              </Title>
            </Group>

            <Paper
              style={{ flexShrink: 1 }}
              mt={10}
              p="sm"
              withBorder
              variant="outlined"
            >
              <Group align="center" w="100%" justify="center">
                <Avatar src={workspace?.avatar} size={64} />
                <Title ta="center" order={2}>
                  {workspace?.name}
                </Title>

                <Button
                  variant="default"
                  onClick={() => {
                    showInfoNotification({
                      title: "Switched workspace",
                    });
                    navigate("/");
                  }}
                >
                  Get started
                </Button>
              </Group>
            </Paper>
          </Stack>
        </Stepper.Completed>
      </Stepper>
    </Container>
  );
};
