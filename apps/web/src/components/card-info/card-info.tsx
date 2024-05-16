import { Alert, AlertProps, Text } from "@mantine/core";
import { IconInfoHexagonFilled } from "@tabler/icons-react";

export const CardInfo = ({ children, ...props }: AlertProps) => {
  return (
    <Alert
      variant="light"
      color="dark.4"
      icon={<IconInfoHexagonFilled stroke={1.5} />}
      styles={{
        wrapper: { alignItems: "center" },
        icon: { color: "#808080" },
      }}
      {...props}
    >
      <Text c="gray.5" fz="sm">
        {children}
      </Text>
    </Alert>
  );
};
