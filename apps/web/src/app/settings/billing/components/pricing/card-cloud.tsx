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

interface CardCloudProps {
  price: number;
  period: string;
  contributors: number;
  disabled: boolean;
}

export const CardCloud = ({
  price,
  period,
  contributors,
  disabled,
}: CardCloudProps) => {
  const discount = period === "yearly" ? 0.8 : 1;
  const pricePerExtraContributor = 7 * discount;
  const extraContributors = Math.max(contributors - 5, 0);

  return (
    <Paper withBorder flex="1 1" radius="md">
      <Stack p="sm" gap={0}>
        <Title c="green.3" order={4}>
          Cloud
        </Title>
        <Title order={1} fz="h1" mt="xs">
          <span style={{ color: "#fff" }}>
            $
            {(
              price * discount +
              extraContributors * pricePerExtraContributor
            ).toFixed(2)}
          </span>
          /mo
        </Title>
        <Text fz="sm">Billed {period}</Text>
        <Divider mt="md" />
        <List
          spacing="xs"
          size="sm"
          mt="lg"
          icon={
            <ThemeIcon color="dark.4" size={20} radius="xl">
              <IconChevronRight size={16} />
            </ThemeIcon>
          }
        >
          <List.Item>
            {Math.floor(price * discount)}$ for first 5 contributors
          </List.Item>
          <List.Item>
            {pricePerExtraContributor.toFixed(2)}$ per extra contributor
          </List.Item>
          <List.Item>1 year data retention</List.Item>
          <List.Item>All features included</List.Item>
        </List>

        <Button mt="lg" fullWidth color="green.6" disabled={disabled}>
          Subscribe
        </Button>
      </Stack>
    </Paper>
  );
};
