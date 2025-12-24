import { Box, Title, Text } from "@mantine/core";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { PageContainer } from "../../../components/page-container";
import { Outlet } from "react-router-dom";

export const DataIngestionPage = () => {
  return (
    <PageContainer>
      <Breadcrumbs
        items={[{ label: "Settings" }, { label: "Data Ingestion" }]}
      />

      <Box maw={600}>
        <Title order={3} mb="md">
          Data Ingestion
        </Title>

        <Text>
          Data ingestion is the process of importing data from external sources
          into your workspace.
        </Text>
      </Box>

      <Outlet />
    </PageContainer>
  );
};
