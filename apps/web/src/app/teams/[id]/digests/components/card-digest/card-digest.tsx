import { Card, Group, Stack, Box, Title, Text } from "@mantine/core";
import { ReactNode } from "react";
import { BadgeStoreStatus } from "../../../../../../components/badge-store-status";

interface CardDigestProps {
  title: string;
  enabled: boolean;
  available: boolean;
  description: string;
  image: ReactNode;
  onClick?: () => void;
}

export const CardDigest = ({
  title,
  enabled,
  available,
  description,
  image,
  onClick,
}: CardDigestProps) => {
  return (
    <Card
      withBorder
      key={title}
      bg="dark.7"
      c={!available ? "dark.3" : undefined}
      className={available ? "grow-on-hover" : ""}
      onClick={onClick}
    >
      <Card.Section
        style={{
          background:
            "radial-gradient(circle, var(--mantine-color-dark-5) 20%, rgba(0, 0, 0, 0.15) 95%)",
          borderBottom: "1px solid var(--mantine-color-dark-5)",
        }}
      >
        <Group align="center" justify="center" h="100%">
          {image}
        </Group>
      </Card.Section>
      <Card.Section p="md">
        <Stack gap="md" h="100%">
          <Box style={{ flexGrow: 1 }}>
            <Title order={2} size="h4">
              {title}
            </Title>
            <Text mt={5}>{description}</Text>
          </Box>
          <BadgeStoreStatus enabled={enabled} available={available} />
        </Stack>
      </Card.Section>
    </Card>
  );
};
