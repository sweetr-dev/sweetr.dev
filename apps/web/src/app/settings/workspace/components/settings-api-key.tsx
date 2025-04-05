import {
  Paper,
  Group,
  Box,
  Text,
  TextInput,
  Button,
  Skeleton,
  Title,
  Alert,
  BoxProps,
} from "@mantine/core";
import { IconInfoCircle, IconRefresh } from "@tabler/icons-react";
import { useApiKey } from "./use-api-key";
import { ButtonCopy } from "../../../../components/button-copy";
import { formatDateAgo } from "../../../../providers/date.provider";
import { parseISO } from "date-fns";

export const SettingsApiKey = (props: BoxProps) => {
  const { apiKey, isGenerating, isLoading, generatedKey, regenerate } =
    useApiKey();

  if (isLoading) {
    return (
      <Box {...props}>
        <Skeleton h={180} />
      </Box>
    );
  }

  return (
    <Box {...props}>
      {generatedKey && (
        <Alert
          mb="xs"
          color="blue"
          icon={<IconInfoCircle size={16} />}
          bd="1px solid var(--mantine-color-blue-outline)"
        >
          Make sure to copy your new key now. You won’t be able to see it again.
        </Alert>
      )}

      <Paper p="md" withBorder>
        <Box flex="1 1">
          <Title order={5}>API Key</Title>
          <Text c="dimmed" size="sm">
            Use this key to authenticate your API requests. Keep it secret and
            never share it.
          </Text>

          <Group align="center" justify="space-between" mt="sm">
            <TextInput
              flex={1}
              value={
                generatedKey || Array.from({ length: 40 }, () => "•").join("")
              }
              readOnly
              rightSection={generatedKey && <ButtonCopy value={generatedKey} />}
            />
            <Button
              variant="default"
              onClick={regenerate}
              loading={isGenerating}
              leftSection={<IconRefresh size={16} />}
            >
              Regenerate
            </Button>
          </Group>
          {apiKey && (
            <>
              <Text mt="xs" size="sm" c="dimmed">
                Generated {formatDateAgo(parseISO(apiKey.createdAt), "ago")} by
                @{apiKey.creator.handle} •{" "}
                {apiKey.lastUsedAt ? (
                  <>
                    Last used{" "}
                    {formatDateAgo(parseISO(apiKey.lastUsedAt), "ago")}
                  </>
                ) : (
                  <>Never used</>
                )}
              </Text>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};
