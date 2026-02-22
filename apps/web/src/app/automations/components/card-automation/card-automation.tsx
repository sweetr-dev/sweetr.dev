import { Card, Group, Stack, Box, Title, Text } from "@mantine/core";
import {
  AutomationBenefit,
  IconAutomationBenefit,
} from "../icon-automation-benefit";
import { AutomationBenefits } from "@sweetr/graphql-types/frontend/graphql";
import { BadgeStoreStatus } from "../../../../components/badge-store-status";

interface CardAutomationProps {
  title: string;
  enabled: boolean;
  available: boolean;
  description: string;
  icon: string;
  color: string;
  benefits?: AutomationBenefits | null;
  onClick?: () => void;
}

export const CardAutomation = ({
  title,
  enabled,
  available,
  description,
  icon,
  color,
  benefits,
  onClick,
}: CardAutomationProps) => {
  return (
    <Card
      withBorder
      key={title}
      bg="dark.7"
      c={!available ? "dark.3" : undefined}
      className={available ? "grow-on-hover" : ""}
      onClick={onClick}
    >
      <Card.Section bg={color} h={180}>
        <Group align="center" justify="center" h="100%">
          <Text fz={80}>{icon}</Text>
        </Group>
      </Card.Section>
      <Card.Section
        p="md"
        style={{ borderBottom: "1px solid #303030", flexGrow: 1 }}
      >
        <Stack gap="md" h="100%" mih={191} justify="space-between">
          <Stack gap="md">
            <Group gap={5}>
              {benefits &&
                Object.entries(benefits).map(
                  ([key, value]) =>
                    value && (
                      <IconAutomationBenefit
                        key={key}
                        enabled={enabled}
                        benefit={key as AutomationBenefit}
                      />
                    ),
                )}
            </Group>
            <Box style={{ flexGrow: 1 }}>
              <Title order={2} size="h4">
                {title}
              </Title>
              <Text mt={5}>{description}</Text>
            </Box>
          </Stack>

          <Box>
            <BadgeStoreStatus enabled={enabled} available={available} />
          </Box>
        </Stack>
      </Card.Section>
    </Card>
  );
};
