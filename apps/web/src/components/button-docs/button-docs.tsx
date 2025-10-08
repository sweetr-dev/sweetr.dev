import { Anchor, Button, ButtonProps } from "@mantine/core";
import { IconBook2 } from "@tabler/icons-react";

export interface ButtonDocsProps extends ButtonProps {
  href: string;
}

export const ButtonDocs = ({ href, ...props }: ButtonDocsProps) => {
  return (
    <Anchor href={href} target="_blank">
      <Button
        leftSection={<IconBook2 stroke={1.5} size={20} />}
        variant="subtle"
        color="dark.1"
        {...props}
      >
        Docs
      </Button>
    </Anchor>
  );
};
