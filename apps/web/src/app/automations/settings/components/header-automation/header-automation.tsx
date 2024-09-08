import { Group, Text, Title, Button, Anchor } from "@mantine/core";
import { PageTitle } from "../../../../../components/page-title";
import { IconBook2 } from "@tabler/icons-react";
import { ImageDemo } from "../image-demo";

interface HeaderAutomationProps {
  icon: string;
  title: string;
  docsUrl: string;
  demoUrl: string;
  description: string;
}

export const HeaderAutomation = ({
  icon,
  title,
  docsUrl,
  demoUrl,
  description,
}: HeaderAutomationProps) => {
  return (
    <>
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

      <ImageDemo title={title} src={demoUrl} />
      <Text mt="sm">{description}</Text>
    </>
  );
};
