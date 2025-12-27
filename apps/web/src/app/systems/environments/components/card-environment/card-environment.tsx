import { Badge, Code, Group, Paper } from "@mantine/core";
import { Environment } from "@sweetr/graphql-types/frontend/graphql";
import { IconEnvironment } from "../../../../../providers/icon.provider";
import { MenuEnvironment } from "./menu-environment";

interface CardEnvironmentProps {
  environment: Environment;
}

export const CardEnvironment = ({ environment }: CardEnvironmentProps) => {
  return (
    <Paper pl="lg" pr="md" radius="md" withBorder>
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <IconEnvironment stroke={1.5} size={20} />

          <Code variant="default" c="white" fz="sm">
            {environment.name}
          </Code>
        </Group>
        <Group gap="xl">
          {environment.archivedAt && (
            <Badge variant="light" color="gray">
              Archived
            </Badge>
          )}
          <MenuEnvironment environment={environment} />
        </Group>
      </Group>
    </Paper>
  );
};
