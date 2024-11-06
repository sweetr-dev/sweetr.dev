import {
  Button,
  Skeleton,
  Image,
  Group,
  Divider,
  Text,
  Stack,
  Alert,
} from "@mantine/core";
import { Link, useParams } from "react-router-dom";
import { DrawerScrollable } from "../../../../../components/drawer-scrollable";
import { LoadableContent } from "../../../../../components/loadable-content";
import { ResourceNotFound } from "../../../../../exceptions/resource-not-found.exception";
import { useDrawerPage } from "../../../../../providers/drawer-page.provider";
import { useMessagingIntegration } from "../../../../../providers/integration.provider";
import ImageMetrics from "../assets/metrics.webp";
import { IconAlertHexagon, IconExternalLink } from "@tabler/icons-react";
import { FormDigestMetrics } from "./components";
export const TeamDigestMetricsPage = () => {
  const { teamId } = useParams();
  const { integration, query } = useMessagingIntegration();
  const drawerProps = useDrawerPage({
    closeUrl: `/teams/${teamId}/digests`,
  });

  if (!teamId) throw new ResourceNotFound();

  return (
    <DrawerScrollable
      {...drawerProps}
      title="Metrics Digest"
      actions={<Button type="submit">Update digest</Button>}
    >
      <LoadableContent
        whenLoading={
          <>
            <Skeleton h={50} />
            <Skeleton h={175} mt={24} />
            <Skeleton h={232} mt="lg" />
            <Skeleton h={36} mt="lg" />
          </>
        }
        isLoading={query.isLoading}
        content={
          <>
            <Group bg="#1a1d20" justify="center">
              <Image src={ImageMetrics} w="auto" h="auto" />
            </Group>
            <Divider />
            <Stack p="md">
              <Text>
                Sends a digest of key metrics and how they have changed since
                last period.
              </Text>
            </Stack>
            <Divider />

            {!integration && (
              <Stack p="md">
                <Alert
                  variant="light"
                  color="violet"
                  styles={{
                    wrapper: {
                      alignItems: "center",
                    },
                  }}
                  icon={<IconAlertHexagon stroke={1.5} />}
                >
                  <Group justify="space-between">
                    <Text>
                      Setup integration with Slack to enable this feature.
                    </Text>
                    <Button
                      size="xs"
                      variant="filled"
                      component={Link}
                      target="_blank"
                      to={`/settings/integrations/slack`}
                      color="violet"
                      rightSection={<IconExternalLink stroke={1.5} size={16} />}
                    >
                      Enable
                    </Button>
                  </Group>
                </Alert>
              </Stack>
            )}

            {integration && <FormDigestMetrics />}
          </>
        }
      />
    </DrawerScrollable>
  );
};
