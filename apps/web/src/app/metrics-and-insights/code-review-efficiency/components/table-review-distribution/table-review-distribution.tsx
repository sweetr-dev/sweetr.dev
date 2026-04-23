import { Group, Paper, Table } from "@mantine/core";
import { CodeReviewDistributionEntity } from "@sweetr/graphql-types/frontend/graphql";
import { AvatarUser } from "../../../../../components/avatar-user";

interface TableReviewDistributionProps {
  reviewers: CodeReviewDistributionEntity[];
}

export const TableReviewDistribution = ({
  reviewers,
}: TableReviewDistributionProps) => {
  return (
    <Paper mt="md" withBorder p="xs" bg="dark.7">
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Reviewer</Table.Th>
            <Table.Th ta="right">Reviews</Table.Th>
            <Table.Th ta="right">%</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {reviewers.map((reviewer) => (
            <Table.Tr key={reviewer.id}>
              <Table.Td>
                <Group gap="xs">
                  <AvatarUser
                    src={reviewer.image}
                    size={24}
                    name={reviewer.name}
                  />
                  {reviewer.name}
                </Group>
              </Table.Td>
              <Table.Td align="right">{reviewer.reviewCount}</Table.Td>
              <Table.Td align="right">
                {reviewer.reviewSharePercentage}%
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
};
