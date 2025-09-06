import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Group,
  Menu,
  Table,
  Text,
} from "@mantine/core";
import { IconDotsVertical, IconTrash } from "@tabler/icons-react";

const jobColors: Record<string, string> = {
  engineer: "blue",
  manager: "cyan",
  designer: "pink",
};

const dummyMembers = [
  {
    name: "John Doe",
    src: "",
    job: "manager",
  },
  {
    name: "John Designer",
    src: "",
    job: "designer",
  },
  {
    name: "Walter Galvao",
    src: "https://avatars.githubusercontent.com/u/1367578?v=4",
    job: "engineer",
  },
  {
    name: "Jackson Malloy",
    src: "https://avatars.githubusercontent.com/u/49698819?v=4",
    job: "engineer",
  },
  {
    name: "Justin Di",
    src: "https://avatars.githubusercontent.com/u/36427961?v=4",
    job: "engineer",
  },
];

export function TableTeamMembers() {
  const rows = dummyMembers.map((item) => (
    <Table.Tr key={item.name}>
      <Table.Td>
        <Group gap="sm">
          <Avatar size={30} src={item.src} radius={30} />
          <Text size="sm" fw={500}>
            {item.name}
          </Text>
        </Group>
      </Table.Td>

      <Table.Td>
        <Badge color={jobColors[item.job.toLowerCase()]} variant="light">
          {item.job}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap={0} justify="right">
          <Menu shadow="md">
            <Menu.Target>
              <ActionIcon color="dark" variant="light">
                <IconDotsVertical size={16} stroke={1.5} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
                Remove
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table verticalSpacing="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Employee</Table.Th>
          <Table.Th>Job title</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows}
        <Table.Tr>
          <Table.Td colSpan={3} align="right">
            <Button variant="subtle">Add member</Button>
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
}
