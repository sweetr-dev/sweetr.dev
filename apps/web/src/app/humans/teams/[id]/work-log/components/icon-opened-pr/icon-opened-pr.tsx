import { IconHexagonFilled, IconProps } from "@tabler/icons-react";

export const IconOpenedPR = (props: IconProps) => {
  return (
    <IconHexagonFilled
      stroke={1.5}
      style={{ color: "var(--mantine-color-green-4)", opacity: 0.8 }}
      {...props}
    />
  );
};
