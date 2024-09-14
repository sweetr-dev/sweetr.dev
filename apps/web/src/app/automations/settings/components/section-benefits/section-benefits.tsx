import { Stack, Paper, Group, Text } from "@mantine/core";
import { benefitLabels } from "../../../../../providers/automation.provider";
import {
  IconAutomationBenefit,
  AutomationBenefit,
} from "../../../components/icon-automation-benefit";

interface SectionBenefitsProps {
  benefits: Record<string, string>;
}
export const SectionBenefits = ({ benefits }: SectionBenefitsProps) => {
  return (
    <>
      <Stack gap="xs">
        {Object.entries(benefits).map(
          ([key, value]) =>
            value && (
              <Paper withBorder p="xs" key={key}>
                <Group wrap="nowrap">
                  <IconAutomationBenefit
                    benefit={key as AutomationBenefit}
                    enabled={true}
                    themeIconProps={{
                      size: "lg",
                      variant: "light",
                    }}
                    showTooltip={false}
                    iconProps={{ size: "20" }}
                  />
                  <Text size="sm">
                    <strong>{benefitLabels[key as AutomationBenefit]}:</strong>{" "}
                    {value}
                  </Text>
                </Group>
              </Paper>
            ),
        )}
      </Stack>
    </>
  );
};
