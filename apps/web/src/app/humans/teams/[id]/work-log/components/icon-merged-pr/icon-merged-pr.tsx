import { IconHexagonFilled, IconProps } from "@tabler/icons-react";

export const IconMergedPR = (props: IconProps) => {
  return (
    <IconHexagonFilled
      stroke={1.5}
      style={{ color: "var(--mantine-color-violet-4)", opacity: 0.8 }}
      {...props}
    />
  );
};
