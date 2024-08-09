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
import { useSupportChat } from "../../../../../components/navbar/use-support-chat";

export const CardEnterprise = () => {
  const { openChat } = useSupportChat();

  return (
    <Paper withBorder flex="1 1" radius="md">
      <Stack p="sm" gap={0}>
        <Title c="green.3" order={4}>
          Enterprise
        </Title>
        <Title order={1} fz="h2" c="white" mt="xs">
          Contact Us
        </Title>
        <Text fz="sm"> Billed yearly</Text>
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
          <List.Item>Unlimited contributors</List.Item>
          <List.Item>Dedicated support</List.Item>
          <List.Item>3+ years data retention</List.Item>
          <List.Item>All features included</List.Item>
        </List>

        <Button
          mt="lg"
          fullWidth
          color="dark.5"
          autoContrast
          onClick={openChat}
        >
          Contact Us
        </Button>
      </Stack>
    </Paper>
  );
};
