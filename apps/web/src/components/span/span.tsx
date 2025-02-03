import { MantineColor, useMantineTheme } from "@mantine/core";

export interface SpanProps {
  children: React.ReactNode;
  color?: MantineColor;
}

export const Span = ({ children, color }: SpanProps) => {
  const theme = useMantineTheme();

  return (
    <span style={color ? { color: theme.colors[color][5] } : {}}>
      {children}
    </span>
  );
};
