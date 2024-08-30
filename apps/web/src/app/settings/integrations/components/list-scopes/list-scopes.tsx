import { List, ThemeIcon, rem, Tooltip, Text } from "@mantine/core";
import { IconLockOpen } from "@tabler/icons-react";

interface ListScopesProps {
  scopes: { label: string; tooltip: string }[];
}

export const ListScopes = ({ scopes }: ListScopesProps) => {
  return (
    <List
      mt="xs"
      spacing="xs"
      center
      icon={
        <ThemeIcon color="dark.1" variant="light" size={20} radius="xs">
          <IconLockOpen style={{ width: rem(16), height: rem(16) }} />
        </ThemeIcon>
      }
    >
      {scopes.map((scope) => (
        <List.Item key={scope.label}>
          <Tooltip label={scope.tooltip} position="right">
            <Text td="underline dotted #a6a7ab 1px">{scope.label}</Text>
          </Tooltip>
        </List.Item>
      ))}
    </List>
  );
};
