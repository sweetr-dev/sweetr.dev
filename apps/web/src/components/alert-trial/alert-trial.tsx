import { BoxProps } from "@mantine/core";
import { useBilling, useTrial } from "../../providers/billing.provider";
import { AlertBanner } from "../alert-banner";
import { differenceInHours, parseISO } from "date-fns";

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

  const getText = () => {
    if (daysLeft === 1) {
      return "You have 1 day left on your trial.";
    }

    if (daysLeft === 0) {
      const hoursLeft = Math.floor(
        differenceInHours(parseISO(trial.endAt), new Date()),
      );

      if (hoursLeft === 0) {
        return `You have less than 1 hour left on your trial.`;
      }

      return `You have ${hoursLeft} ${hoursLeft === 1 ? "hour" : "hours"} left on your trial.`;
    }

    return `You have ${daysLeft} days left on your trial.`;
  };

  return (
    <AlertBanner
      color={color}
      text={getText()}
      ctaHref="/settings/billing"
      ctaText="Upgrade now"
      alertProps={props}
    />
  );
};
