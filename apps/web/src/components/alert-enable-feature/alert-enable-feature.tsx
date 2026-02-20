import { AlertProps } from "@mantine/core";
import { AlertBanner } from "../alert-banner";

type Feature = "deployments" | "slack";

type AlertEnableFeatureProps = AlertProps & {
  feature: Feature;
};

const featureMap: Record<Feature, { text: string; href: string }> = {
  deployments: {
    text: "Setup deployment ingestion to use this feature.",
    href: "https://docs.sweetr.dev/features/deployments",
  },
  slack: {
    text: "Setup integration with Slack to enable this feature.",
    href: "/settings/integrations/slack",
  },
};

export const AlertEnableFeature = ({
  feature,
  ...props
}: AlertEnableFeatureProps) => {
  const { text, href } = featureMap[feature];

  return (
    <AlertBanner
      text={text}
      ctaHref={href}
      ctaText="Setup"
      alertProps={props}
    />
  );
};
