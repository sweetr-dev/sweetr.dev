import { CopyButton, Tooltip, ActionIcon } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";

interface ButtonCopyProps {
  value: string;
}

export const ButtonCopy = ({ value }: ButtonCopyProps) => {
  return (
    <CopyButton value={value} timeout={2000}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? "Copied" : "Copy"} withArrow>
          <ActionIcon onClick={copy} variant="transparent" color="dark.1">
            {copied ? (
              <IconCheck size={16} stroke={1.5} />
            ) : (
              <IconCopy size={16} stroke={1.5} />
            )}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
  );
};
