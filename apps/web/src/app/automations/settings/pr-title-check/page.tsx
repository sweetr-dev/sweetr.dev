import {
  Box,
  Divider,
  Stack,
  Title,
  Skeleton,
  Input,
  Loader,
  Group,
  Button,
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
import { IconExternalLink } from "@tabler/icons-react";
import { Link } from "react-router-dom";

export const AutomationPrTitleCheckPage = () => {
  const { automationSettings, isLoading, mutate, isMutating } =
    useAutomationSettings(AutomationType.PR_TITLE_CHECK);

  const { automationCards } = useAutomationCards();

  const automation = automationCards.PR_TITLE_CHECK;

  const handleUpdate = useDebouncedCallback((pattern) => {
    mutate(automationSettings!.enabled, {
      pattern,
    });
  }, 500);

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
                        placeholder="/^\[[A-Z]+-\d+\] .+$/"
                        defaultValue={
                          (automationSettings.settings as any).pattern || ""
                        }
                        onChange={(e) => handleUpdate(e.target.value)}
                        maxLength={100}
                      ></Input>
                    </BoxSetting>

                    <BoxSetting left="Popular Patterns">
                      {" "}
                      <Button
                        variant="light"
                        color="green"
                        component={Link}
                        target="_blank"
                        to="https://regex101.com/r/8q8q0L"
                        rel="noreferrer"
                        rightSection={
                          <IconExternalLink stroke={1.5} size={16} />
                        }
                      >
                        See Examples
                      </Button>
                    </BoxSetting>
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
