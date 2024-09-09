import {
  Box,
  Divider,
  Stack,
  Title,
  Skeleton,
  Input,
  Loader,
  Group,
  Anchor,
} from "@mantine/core";
import { Breadcrumbs } from "../../../../components/breadcrumbs";
import { PageContainer } from "../../../../components/page-container";
import { LoadableContent } from "../../../../components/loadable-content";
import { AutomationType } from "@sweetr/graphql-types/frontend/graphql";
import { useAutomationSettings } from "../use-automation";
import { useAutomationCards } from "../../use-automation-cards";
import { SettingEnable } from "../components/settings-enable/setting-enable";
import { HeaderAutomation } from "../components/header-automation";
import { SectionBenefits } from "../components/section-benefits/section-benefits";
import { BoxSetting } from "../components/box-setting";
import { useDebouncedCallback } from "@mantine/hooks";
import {
  IconCircleCheck,
  IconExclamationCircle,
  IconExternalLink,
} from "@tabler/icons-react";
import { useState } from "react";
import { showErrorNotification } from "../../../../providers/notification.provider";

export const AutomationPrTitleCheckPage = () => {
  const { automationSettings, isLoading, mutate, isMutating } =
    useAutomationSettings(AutomationType.PR_TITLE_CHECK);
  const { automationCards } = useAutomationCards();
  const automation = automationCards.PR_TITLE_CHECK;
  const [isValidRegEx, setIsValidRegEx] = useState<boolean | null>(null);
  const [isValidExample, setIsValidExample] = useState<boolean | null>(null);

  const getInputIcon = (isValid: boolean | null) => {
    if (isValid === null) return <Box w={14}></Box>;

    if (isValid)
      return (
        <IconCircleCheck
          size={14}
          stroke={1.5}
          color="var(--mantine-color-green-5)"
        />
      );

    return (
      <IconExclamationCircle
        size={14}
        stroke={1.5}
        color="var(--mantine-color-red-5)"
      />
    );
  };

  const validateRegEx = (updatedSettings: Record<string, any>) => {
    if (!updatedSettings.regex) return true;

    try {
      const regex = new RegExp(updatedSettings.regex);

      setIsValidRegEx(true);

      if (updatedSettings.regex && updatedSettings.regexExample) {
        const isValidExample = regex.test(updatedSettings.regexExample);

        setIsValidExample(isValidExample);

        if (!isValidExample) {
          showErrorNotification({
            message: "This example doesn't match the RegEx pattern",
          });
          return false;
        }
      }
    } catch {
      setIsValidRegEx(false);

      showErrorNotification({
        message: "Invalid Regular Expression",
      });

      return false;
    }

    return true;
  };

  const handleUpdate = useDebouncedCallback(
    (settings: Record<string, unknown>) => {
      const updatedSettings = {
        ...(automationSettings ? (automationSettings.settings as any) : {}),
        ...settings,
      };

      if (validateRegEx(updatedSettings)) {
        mutate(automationSettings!.enabled, updatedSettings);
      }
    },
    500,
  );

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "Automations", href: "/automations" },
          { label: automation?.title || "" },
        ]}
      />

      <Box maw={700}>
        <LoadableContent
          whenLoading={
            <>
              <Skeleton h={50} />
              <Skeleton h={250} mt={26} />
              <Skeleton h={70} mt="lg" />
              <Skeleton h={70} mt="lg" />
            </>
          }
          isLoading={isLoading}
          content={
            <>
              <HeaderAutomation
                icon={automation?.icon}
                title={automation?.title}
                docsUrl={automation?.docsUrl}
                demoUrl={automation?.demoUrl}
                description={automation?.description}
              />

              {automation && <SectionBenefits benefits={automation.benefits} />}
              <Divider my="lg" />

              <Group justify="space-between" align="center">
                <Title order={5} mb="sm">
                  Setup
                </Title>
                {isMutating && <Loader size="xs" />}
              </Group>
              <Stack>
                {automation && (
                  <SettingEnable
                    enabled={automationSettings?.enabled}
                    type={AutomationType.PR_TITLE_CHECK}
                  />
                )}

                {automationSettings && (
                  <>
                    <BoxSetting
                      left="Title Pattern"
                      description="Set the regular expression which PR titles must match."
                    >
                      <Input
                        maw={200}
                        placeholder="^\[[A-Za-z]+-\d+\] .+$"
                        defaultValue={
                          (automationSettings.settings as any).regex || ""
                        }
                        rightSection={getInputIcon(isValidRegEx)}
                        onChange={(e) =>
                          handleUpdate({ regex: e.target.value })
                        }
                        maxLength={100}
                      ></Input>
                    </BoxSetting>

                    <BoxSetting
                      left="Example Value"
                      description="This will show in GitHub for developers to understand what the pattern is."
                    >
                      <Input
                        maw={200}
                        placeholder="[KEY-100] Title"
                        color="red"
                        c="red"
                        rightSection={getInputIcon(isValidExample)}
                        defaultValue={
                          (automationSettings.settings as any).regexExample ||
                          ""
                        }
                        onChange={(e) =>
                          handleUpdate({
                            regexExample: e.target.value,
                          })
                        }
                        maxLength={100}
                      ></Input>
                    </BoxSetting>

                    <Anchor
                      fz="sm"
                      ml="auto"
                      target="_blank"
                      href="https://regex101.com/r/8q8q0L"
                      rel="noreferrer"
                      w="fit-content"
                    >
                      <Group gap={5} align="center">
                        See popular RegEx patterns in our docs
                        <IconExternalLink stroke={1.5} size={16} />
                      </Group>
                    </Anchor>
                  </>
                )}
              </Stack>
            </>
          }
        />
      </Box>
    </PageContainer>
  );
};
