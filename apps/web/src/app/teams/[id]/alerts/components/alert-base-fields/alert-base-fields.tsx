import {
  Stack,
  Title,
  Switch,
  Input,
  Group,
  Tooltip,
  Button,
  Text,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconBrandSlack, IconInfoCircle } from "@tabler/icons-react";
import { useRef, useEffect } from "react";
import { BoxSetting } from "../../../../../../components/box-setting";
import { useSendTestMessage } from "../../../use-send-test-message";
import { BaseFormAlert } from "../../settings/types";
import { Tip } from "../../../../../../components/tip";

interface AlertBaseFieldsProps<T> {
  form: UseFormReturnType<T>;
}

export const AlertBaseFields = <T extends BaseFormAlert>({
  form,
}: AlertBaseFieldsProps<T>) => {
  const { sendTestMessage, isSendingTestMessage } = useSendTestMessage();
  const isEnabled = form.values.enabled;

  const channelRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isEnabled && !form.values.channel) {
      channelRef.current?.focus();
    }
  }, [isEnabled, form.values.channel]);

  return (
    <>
      <Stack p="md">
        <Title order={5}>Settings</Title>

        <BoxSetting label="Enabled">
          <Switch
            size="lg"
            color="green.7"
            onLabel="ON"
            offLabel="OFF"
            {...form.getInputProps("enabled", { type: "checkbox" })}
          />
        </BoxSetting>

        {isEnabled && (
          <>
            <Input.Wrapper>
              <Input.Label required>Channel</Input.Label>
              <Group align="top">
                <Stack gap="5px" flex="1">
                  <Input
                    ref={channelRef}
                    leftSection={<>#</>}
                    flex="1"
                    {...form.getInputProps("channel")}
                  />
                  {form.getInputProps("channel").error && (
                    <Input.Error>
                      {form.getInputProps("channel").error}
                    </Input.Error>
                  )}
                </Stack>
                <Tooltip label="Send a test message to the channel" withArrow>
                  <Button
                    variant="default"
                    onClick={() => {
                      sendTestMessage(form.values.channel);
                    }}
                    leftSection={<IconBrandSlack size={16} stroke={1.5} />}
                    loading={isSendingTestMessage}
                  >
                    Test
                  </Button>
                </Tooltip>
              </Group>
            </Input.Wrapper>

            <Tip>
              Sweetr is only able to auto join public channels. You must
              manually invite @Sweetr to private channels.
            </Tip>
          </>
        )}
      </Stack>
    </>
  );
};
