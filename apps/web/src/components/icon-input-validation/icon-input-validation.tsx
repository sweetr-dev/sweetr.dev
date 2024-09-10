import { Box } from "@mantine/core";
import { IconCircleCheck, IconExclamationCircle } from "@tabler/icons-react";

interface IconInputValidationProps {
  isValid: boolean | null;
  size?: number;
}

export const IconInputValidation = ({
  isValid,
  size = 14,
}: IconInputValidationProps) => {
  if (isValid === null) return <Box w={size}></Box>;

  if (isValid) {
    return (
      <IconCircleCheck
        size={size}
        stroke={1.5}
        color="var(--mantine-color-green-5)"
      />
    );
  }

  return (
    <IconExclamationCircle
      size={size}
      stroke={1.5}
      color="var(--mantine-color-red-5)"
    />
  );
};
