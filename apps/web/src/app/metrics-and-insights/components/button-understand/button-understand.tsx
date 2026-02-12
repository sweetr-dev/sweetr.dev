import { Button, HoverCard } from "@mantine/core";
import { IconInfoHexagon } from "@tabler/icons-react";
import { ReactNode } from "react";

interface ButtonUnderstandProps {
  children: ReactNode;
}

export const ButtonUnderstand = ({ children }: ButtonUnderstandProps) => {
  return (
    <HoverCard width={300} withArrow position="right">
      <HoverCard.Target>
        <Button
          bg="dark.7"
          leftSection={<IconInfoHexagon stroke={1.5} size={16} />}
          variant="default"
        >
          Info
        </Button>
      </HoverCard.Target>
      <HoverCard.Dropdown>{children}</HoverCard.Dropdown>
    </HoverCard>
  );
};
