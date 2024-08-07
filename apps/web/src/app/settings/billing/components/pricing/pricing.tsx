import {
  Stack,
  SegmentedControl,
  Group,
  Box,
  Badge,
  Paper,
  Slider,
  Text,
} from "@mantine/core";
import { CardEnterprise } from "./card-enterprise";
import { CardCloud } from "./card-cloud";
import { useState } from "react";
import { Faq } from "./faq";
import { IconChevronUp } from "@tabler/icons-react";

export const Pricing = () => {
  const currentUsage = 45;
  const [period, setPeriod] = useState("monthly");
  const [contributors, setContributors] = useState(currentUsage);

  return (
    <>
      <Stack>
        <SegmentedControl
          radius="xl"
          color="gray.4"
          autoContrast
          mx="auto"
          value={period}
          onChange={setPeriod}
          data={[
            {
              value: "monthly",
              label: "Monthly",
            },
            {
              value: "yearly",
              label: (
                <Group wrap="nowrap" gap={5}>
                  <Box>Yearly </Box>
                  <Badge size="xs" color="green.6">
                    20% off
                  </Badge>
                </Group>
              ),
            },
          ]}
        />
        <Box mt="lg" mb="md">
          <Group justify="space-between">
            <Text component="span" fw={700} c="white" fz="sm">
              {contributors} contributors
            </Text>
            {contributors === currentUsage && (
              <Text fw={600} fz="sm" c="green">
                Fits your current usage.
              </Text>
            )}
            {contributors < currentUsage && (
              <Text fw={600} fz="sm" c="red">
                You can't subscribe for less seats than your current usage.
              </Text>
            )}
            {contributors > currentUsage && (
              <Text fw={600} fz="sm" c="orange.3">
                This is more than you need, based on your current usage.
              </Text>
            )}
          </Group>
          <Slider
            mt={4}
            label={null}
            defaultValue={currentUsage}
            max={150}
            min={1}
            onChange={setContributors}
            color="gray.4"
            marks={[
              {
                value: currentUsage,
                label: <IconChevronUp stroke={1} color="#40c057" />,
              },
            ]}
          />
        </Box>
        <Group>
          <CardCloud
            price={49}
            period={period}
            contributors={contributors}
            disabled={contributors < currentUsage}
          />
          <CardEnterprise />
        </Group>
        <Paper mt="lg" radius="md">
          <Faq />
        </Paper>
      </Stack>
    </>
  );
};
