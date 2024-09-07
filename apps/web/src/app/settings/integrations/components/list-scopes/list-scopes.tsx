import { List, Tooltip, Text } from "@mantine/core";
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
      icon={<IconLockOpen size={16} stroke={1.5} />}
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
