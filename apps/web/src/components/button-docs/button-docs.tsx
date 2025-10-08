import { Anchor, Button } from "@mantine/core";
import { IconBook2 } from "@tabler/icons-react";

export interface ButtonDocsProps {
  href: string;
}

export const ButtonDocs = ({ href }: ButtonDocsProps) => {
  return (
    <Anchor href={href} target="_blank">
      <Button
        leftSection={<IconBook2 stroke={1.5} size={20} />}
        variant="subtle"
        color="dark.1"
      >
        Docs
      </Button>
    </Anchor>
  );
};
