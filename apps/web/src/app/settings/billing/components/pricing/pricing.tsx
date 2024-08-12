import {
  Stack,
  SegmentedControl,
  Group,
  Box,
  Badge,
  Paper,
  Slider,
  Text,
  Skeleton,
} from "@mantine/core";
import { CardEnterprise } from "./card-enterprise";
import { CardCloud } from "./card-cloud";
import { useState } from "react";
import { Faq } from "./faq";
import { IconChevronUp } from "@tabler/icons-react";
import { SubscriptionPeriod } from "./types";

interface PricingProps {
  plan: {
    monthly: string;
    yearly: string;
  };
  currentUsage: number;
}

export const Pricing = ({ plan, currentUsage }: PricingProps) => {
  const max = 100;
  const [period, setPeriod] = useState<SubscriptionPeriod>("monthly");
  const [contributors, setContributors] = useState(
    currentUsage < 5 ? 10 : currentUsage,
  );

  return (
    <>
      <Stack>
        <SegmentedControl
          radius="xl"
          color="dark.6"
          autoContrast
          mx="auto"
          value={period}
          onChange={(value: string) => setPeriod(value as SubscriptionPeriod)}
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
            {currentUsage > 5 && (
              <>
                {contributors === currentUsage && (
                  <Text fw={600} fz="sm" c="green">
                    Fits your current usage.
                  </Text>
                )}
                {contributors < currentUsage && (
                  <Text fw={600} fz="sm" c="red">
                    You can&apos;t subscribe for less seats than your current
                    usage.
                  </Text>
                )}
                {contributors > currentUsage && contributors < max && (
                  <Text fw={600} fz="sm" c="orange.3">
                    This is more than you need, based on your current usage.
                  </Text>
                )}
              </>
            )}
            {contributors >= max && (
              <Text fw={600} fz="sm" c="orange.3">
                Contact us for an enterprise plan.
              </Text>
            )}
          </Group>
          <Slider
            mt={4}
            label={null}
            defaultValue={Math.max(10, currentUsage)}
            max={max}
            min={5}
            onChange={setContributors}
            color="dark.2"
            marks={
              currentUsage > 5
                ? [
                    {
                      value: currentUsage,
                      label: <IconChevronUp stroke={1} color="#40c057" />,
                    },
                  ]
                : undefined
            }
          />
        </Box>
        <Group>
          <CardCloud
            price={49}
            period={period}
            contributors={contributors}
            plan={plan}
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

export const PricingSkeleton = () => {
  return (
    <Stack>
      <Skeleton h={40} w={196} mx="auto"></Skeleton>
      <Box mt="lg">
        <Skeleton h={57} />
      </Box>
      <Group justify="space-between">
        <Skeleton h={333} w={342} radius="md" />
        <Skeleton h={333} w={342} radius="md" />
      </Group>
      <Skeleton h={151} mt="lg" radius="md" />
    </Stack>
  );
};
