import { Badge, BadgeProps } from "@mantine/core";

export const PaperTitle = ({ children, ...props }: BadgeProps) => {
  return (
    <Badge variant="subtle" mb="md" px={0} {...props}>
      {children}
    </Badge>
  );
};
