import { Tooltip, ThemeIcon, ThemeIconProps } from "@mantine/core";
import { AutomationBenefits } from "@sweetr/graphql-types/frontend/graphql";
import {
  IconBug,
  IconClockBolt,
  IconGavel,
  IconKeyboardHide,
  IconLock,
  IconProps,
} from "@tabler/icons-react";
import { ReactElement } from "react";
import { benefitLabels } from "../../../../providers/automation.provider";

export type AutomationBenefit = keyof Omit<AutomationBenefits, "__typename">;

interface IconAutomationBenefitProps {
  benefit: AutomationBenefit;
  enabled: boolean;
  showTooltip?: boolean;
  themeIconProps?: ThemeIconProps;
  iconProps?: IconProps;
}

const getIcon = (benefit: AutomationBenefit, iconProps?: IconProps) => {
  const icons: Record<AutomationBenefit, () => ReactElement> = {
    cycleTime: () => <IconClockBolt stroke={1.5} size="16" {...iconProps} />,
    failureRate: () => <IconBug stroke={1.5} size="16" {...iconProps} />,
    techDebt: () => <IconKeyboardHide stroke={1.5} size="16" {...iconProps} />,
    security: () => <IconLock stroke={1.5} size="16" {...iconProps} />,
    compliance: () => <IconGavel stroke={1.5} size="16" {...iconProps} />,
  };

  return icons[benefit];
};

export const IconAutomationBenefit = ({
  benefit,
  enabled,
  showTooltip = true,
  themeIconProps,
  iconProps,
}: IconAutomationBenefitProps) => {
  return (
    <Tooltip
      label={benefitLabels[benefit]}
      position="bottom"
      disabled={!showTooltip}
    >
      <ThemeIcon
        variant={enabled ? "light" : "default"}
        {...themeIconProps}
        bd={
          enabled
            ? "1px solid var(--mantine-color-green-light-hover)"
            : undefined
        }
      >
        {getIcon(benefit, iconProps)()}
      </ThemeIcon>
    </Tooltip>
  );
};
