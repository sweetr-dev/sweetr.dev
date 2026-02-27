import {
  Paper,
  Stack,
  Title,
  Button,
  Text,
  List,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { useWorkspace } from "../../../../../providers/workspace.provider";
import { SubscriptionPeriod } from "./types";
import { useState } from "react";

interface CardCloudProps {
  period: SubscriptionPeriod;
  contributors: number;
  disabled: boolean;
  plan: {
    monthly: string;
    yearly: string;
  };
}

export const CardCloud = ({
  period,
  contributors,
  disabled,
  plan,
}: CardCloudProps) => {
  const { workspace } = useWorkspace();
  const discount = period === "yearly" ? 0.8 : 1;
  const pricePerContributor = 10 * discount;
  const totalPrice = Math.floor(pricePerContributor * contributors);
  const [isSubscribing, setIsSubscribing] = useState(false);

  return (
    <Paper withBorder flex="1 1" radius="md">
      <Stack p="sm" gap={0}>
        <Title c="green.3" order={4}>
          Cloud
        </Title>
        <Title order={1} fz="h2" mt="xs" c="dimmed">
          <span style={{ color: "#fff" }}>${totalPrice.toFixed(2)}</span>
          /mo
        </Title>
        <Text fz="sm">Billed {period}</Text>
        <Divider mt="md" />
        <List
          spacing="xs"
          size="sm"
          mt="lg"
          icon={
            <ThemeIcon color="dark.6" size={20} radius="xl">
              <IconChevronRight size={16} />
            </ThemeIcon>
          }
        >
          <List.Item>
            {pricePerContributor.toFixed(2)}$ per contributor
          </List.Item>
          <List.Item>Regular support</List.Item>
          <List.Item>1 year data retention</List.Item>
          <List.Item>All features included</List.Item>
        </List>

        <form
          method="POST"
          action={`${import.meta.env.VITE_GRAPHQL_API}/stripe/checkout`}
          onSubmit={() => setIsSubscribing(true)}
        >
          <input type="hidden" name="quantity" value={contributors} />
          <input type="hidden" name="workspaceId" value={workspace.id} />
          <input type="hidden" name="key" value={plan[period]} />
          <Button
            type="submit"
            mt="lg"
            fullWidth
            color="green.6"
            disabled={disabled}
            loading={isSubscribing}
          >
            Subscribe
          </Button>
        </form>
      </Stack>
    </Paper>
  );
};
