import { Accordion, Anchor, ThemeIcon, Text } from "@mantine/core";
import { IconShield, IconUser, IconCurrencyDollar } from "@tabler/icons-react";

export const Faq = () => {
  return (
    <Accordion variant="contained" radius="md">
      <Accordion.Item value="contributors">
        <Accordion.Control
          icon={
            <ThemeIcon variant="light" color="blue">
              <IconUser size={20} />
            </ThemeIcon>
          }
        >
          What is considered a contributor?
        </Accordion.Control>
        <Accordion.Panel>
          A contributor is any user on GitHub who has created or reviewed a Pull
          Request.
          <Text mt="xs">
            Subscriptions are updated automatically every month to reflect
            usage.
          </Text>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="discount">
        <Accordion.Control
          icon={
            <ThemeIcon variant="light" color="violet">
              <IconCurrencyDollar size={20} />
            </ThemeIcon>
          }
        >
          Are discounts availables?
        </Accordion.Control>
        <Accordion.Panel>
          Reach out for discounts if you are a non-profit or an open-source
          project.
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="camera">
        <Accordion.Control
          icon={
            <ThemeIcon variant="light" color="green">
              <IconShield size={20} />
            </ThemeIcon>
          }
        >
          Is it secure?
        </Accordion.Control>
        <Accordion.Panel>
          Absolutely. Sweetr does not require access to your code. We follow
          stringent security best practices to protect our servers and
          application.{" "}
          <Anchor
            href="https://docs.sweetr.dev/about/data-privacy-and-security"
            target="_blank"
          >
            Read more.
          </Anchor>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};
