import {
  Group,
  Paper,
  PaperProps,
  Stack,
  ThemeIcon,
  Text,
} from "@mantine/core";
import { IconProps } from "@tabler/icons-react";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

interface CardChartProps extends PaperProps {
  label: string;
  description: string;
  icon: React.ComponentType<IconProps>;
  href: string;
}

export const CardChart: FC<CardChartProps> = ({
  label,
  description,
  icon: Icon,
  href,
  ...paperProps
}) => {
  const navigate = useNavigate();

  return (
    <Paper
      withBorder
      radius="md"
      p="xs"
      className="grow-on-hover"
      onClick={() => navigate(href)}
      {...paperProps}
    >
      <Group wrap="nowrap">
        <ThemeIcon variant="light">
          <Icon stroke={1.5} size={20} />
        </ThemeIcon>

        <Stack gap={0}>
          {label}
          <Text size="xs" color="dimmed">
            {description}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
};
