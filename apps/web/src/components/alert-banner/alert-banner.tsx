import {
  Alert,
  Group,
  Button,
  Text,
  AlertProps,
  ButtonProps,
  MantineColor,
} from "@mantine/core";
import { IconAlertHexagon, IconExternalLink } from "@tabler/icons-react";
import { Link } from "react-router-dom";

interface AlertBannerProps {
  text: string;
  ctaHref: string;
  ctaText: string;
  alertProps?: AlertProps;
  buttonProps?: ButtonProps;
  color?: MantineColor;
}

export const AlertBanner = ({
  alertProps,
  buttonProps,
  text,
  ctaHref,
  ctaText,
  color = "violet",
}: AlertBannerProps) => {
  return (
    <Alert
      variant="light"
      color={color}
      styles={{
        wrapper: {
          alignItems: "center",
        },
      }}
      bd={`1px solid var(--mantine-color-${color}-4)`}
      icon={<IconAlertHexagon stroke={1.5} />}
      {...alertProps}
    >
      <Group justify="space-between">
        <Text>{text}</Text>
        <Button
          size="xs"
          variant="filled"
          component={Link}
          target="_blank"
          to={ctaHref}
          color={color}
          rel="noopener noreferrer"
          rightSection={<IconExternalLink stroke={1.5} size={16} />}
          {...buttonProps}
        >
          {ctaText}
        </Button>
      </Group>
    </Alert>
  );
};
