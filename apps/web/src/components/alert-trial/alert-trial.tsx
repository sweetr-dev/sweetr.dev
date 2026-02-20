import { BoxProps } from "@mantine/core";
import { useBilling, useTrial } from "../../providers/billing.provider";
import { AlertBanner } from "../alert-banner";

type AlertTrialProps = BoxProps;

export const AlertTrial = ({ ...props }: AlertTrialProps) => {
  const { hasActiveSubscription } = useBilling();
  const { trial, daysLeft } = useTrial();

  if (!trial || hasActiveSubscription) {
    return null;
  }

  if (daysLeft === null) return null;

  const isAboutToExpire = daysLeft < 2;

  const color = isAboutToExpire ? "red" : "violet";

  return (
    <AlertBanner
      color={color}
      text={`You have ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left on your
            trial.`}
      ctaHref="/settings/billing"
      ctaText="Upgrade now"
      alertProps={props}
    />
  );
};
