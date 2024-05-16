import {
  createStyles,
  Container,
  Title,
  rem,
  Accordion,
  ThemeIcon,
  Box,
  Center,
  Anchor,
  List,
} from "@mantine/core";
import { IconCornerDownRight, IconLockOpen } from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: rem(34),
    fontWeight: 200,

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(24),
    },
  },
}));

export function Faq() {
  const { classes } = useStyles();

  return (
    <Container py="xl" mt={80}>
      <Title order={2} className={classes.title} ta="center" mt="sm">
        Frequently Asked Questions
      </Title>

      <Center>
        <Box maw="100%" w={650}>
          <Accordion
            mt="lg"
            w="100%"
            variant="separated"
            chevronSize={50}
            defaultValue="repository-safe"
          >
            <Accordion.Item value="repository-safe">
              <Accordion.Control>
                <strong>Is my repository code safe?</strong>
              </Accordion.Control>
              <Accordion.Panel>
                Absolutely. Sweetr never clones your repository, nor persists
                any data from it. We follow stringent security best practices to
                protect our servers.{" "}
                <Anchor
                  href="https://docs.github.com/en/apps/creating-github-apps/setting-up-a-github-app/about-creating-github-apps#github-apps-offer-enhanced-security"
                  rel="nofollow"
                  target="_blank"
                >
                  GitHub Apps offer enhanced security.
                </Anchor>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="data">
              <Accordion.Control>
                <strong>How is my data used? Can I delete it?</strong>
              </Accordion.Control>
              <Accordion.Panel>
                Sweetr only saves data necessary to provide service to you. You
                can delete all your data from our servers by revoking OAuth
                access or uninstalling our application from your GitHub account
                or organization at any moment.
                <Anchor
                  mt="xs"
                  display="block"
                  href="/privacy-policy"
                  target="_blank"
                >
                  Read our privacy policy.
                </Anchor>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="gh-permissions">
              <Accordion.Control>
                <strong>How are the GitHub permissions used?</strong>
              </Accordion.Control>
              <Accordion.Panel>
                <List
                  spacing="md"
                  icon={
                    <ThemeIcon color="blue" size={24} radius="xl">
                      <IconLockOpen size="1rem" />
                    </ThemeIcon>
                  }
                >
                  <List.Item>
                    Contents (Read):
                    <List>
                      <List.Item icon={<IconCornerDownRight />}>
                        Used to read yarn.lock/npm-package.lock content.
                      </List.Item>
                    </List>
                  </List.Item>
                  <List.Item>
                    Pull Requests (Read/Write):
                    <List>
                      <List.Item icon={<IconCornerDownRight />}>
                        Used to add comments to PRs.
                      </List.Item>
                    </List>
                  </List.Item>
                  <List.Item>
                    Organization members (Read):
                    <List>
                      <List.Item icon={<IconCornerDownRight />}>
                        Used to automatically give members access to the
                        workspace.
                      </List.Item>
                    </List>
                  </List.Item>
                  <List.Item>
                    Email address (Read):
                    <List>
                      <List.Item icon={<IconCornerDownRight />}>
                        Used for future support of multiple OAuth providers
                        (GitLab/BitBucket) and notifications.
                      </List.Item>
                    </List>
                  </List.Item>
                </List>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="gitlab-bitbucket">
              <Accordion.Control>
                <strong>Is GitLab or BitBucket supported?</strong>
              </Accordion.Control>
              <Accordion.Panel>
                You can check the status on{" "}
                <Anchor
                  href="https://github.com/orgs/sweetr-dev/discussions/4"
                  target="_blank"
                  rel="nofollow"
                >
                  BitBucket
                </Anchor>{" "}
                or{" "}
                <Anchor
                  href="https://github.com/orgs/sweetr-dev/discussions/3"
                  target="_blank"
                  rel="nofollow"
                >
                  GitLab
                </Anchor>{" "}
                integrations in our GitHub.
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="monorepo">
              <Accordion.Control>
                <strong>Are monorepos supported?</strong>
              </Accordion.Control>
              <Accordion.Panel>
                Yes, we fully support monorepos and will continue to do so for
                every new feature.
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="payment">
              <Accordion.Control>
                <strong>How about pricing?</strong>
              </Accordion.Control>
              <Accordion.Panel>
                <strong>Always</strong> free for non-commercial open source
                projects.
                <Box mt="xs">
                  Pricing for commercial usage will be introduced once we have
                  more features.
                </Box>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Box>
      </Center>
    </Container>
  );
}
