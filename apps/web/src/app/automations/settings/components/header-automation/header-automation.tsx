import { Group, Text, Title, Button, Anchor, Box } from "@mantine/core";
import { PageTitle } from "../../../../../components/page-title";
import { IconBook2 } from "@tabler/icons-react";
import { ImageDemo } from "../image-demo";
import { ReactNode } from "react";

interface HeaderAutomationProps {
  icon: string;
  title: string;
  docsUrl: string;
  demoUrl: string;
  description: string;
  demoImgHeight?: number;
  benefits: ReactNode;
}

export const HeaderAutomation = ({
  icon,
  title,
  docsUrl,
  demoUrl,
  description,
  demoImgHeight,
  benefits,
}: HeaderAutomationProps) => {
  return (
    <>
      <ImageDemo title={title} src={demoUrl} height={demoImgHeight} />

      <Box mt="xl" bg="dark.8">
        <PageTitle
          title={
            <Group gap="xs">
              <Text fz={32}>{icon}</Text>
              <Title mb={0} order={2}>
                {title}
              </Title>
            </Group>
          }
        >
          {docsUrl && (
            <Anchor underline="never" target="_blank" href={docsUrl}>
              <Button
                variant="subtle"
                color="dark.1"
                leftSection={<IconBook2 stroke={1.5} size={20} />}
              >
                Docs
              </Button>
            </Anchor>
          )}
        </PageTitle>

        <Text mt="md">{description}</Text>
        <Box mt="md">{benefits}</Box>
      </Box>
    </>
  );
};
