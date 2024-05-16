import {
  createStyles,
  Title,
  Text,
  SimpleGrid,
  Container,
  rem,
  Anchor,
  Box,
  Center,
  List,
  Paper,
  Group,
} from "@mantine/core";
import { ProductCard } from "./product-card";
import {
  IconBrandGithub,
  IconDiscountCheck,
  IconSettings2,
} from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: rem(34),
    fontWeight: 200,

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(24),
    },
  },

  description: {
    maxWidth: 600,
    margin: "auto",

    "&::after": {
      content: '""',
      display: "block",
      backgroundColor: theme.fn.primaryColor(),
      width: rem(45),
      height: rem(2),
      marginTop: theme.spacing.sm,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },

  githubPaper: {
    display: "flex",
    alignItems: "center",
  },
}));

const products = [
  {
    title: "Dependency Changes Summary",
    description: (
      <>
        Adds a comment to PRs summarizing dependency changes.
        <List spacing="sm" mt="xl">
          <List.Item icon={<IconDiscountCheck stroke={1.5} />}>
            De-risk PRs, get dependency changes reviewed.
          </List.Item>
          <List.Item icon={<IconDiscountCheck stroke={1.5} />}>
            Evaluate package&apos;s health, bundle size and vulnerabilities.
          </List.Item>
          <List.Item icon={<IconSettings2 stroke={1.5} />}>
            Works with NPM and Yarn.
          </List.Item>
        </List>
      </>
    ),
    demoUrl: "https://github.com/sweetr-dev/public/pull/1/files",
    docsUrl: "https://docs.sweetr.dev/features/dependency-changes",
    cover: "/dependencies-demo.png",
    isLive: true,
  },
  {
    title: "Pull Request Size Labeler",
    description: (
      <>
        Adds a label to PRs indicating size of changes.
        <List spacing="sm" mt="xl">
          <List.Item icon={<IconDiscountCheck stroke={1.5} />}>
            Encourage a culture of smaller PRs.
          </List.Item>
          <List.Item icon={<IconDiscountCheck stroke={1.5} />}>
            De-risk magnitude of changes and get faster PR reviews.
          </List.Item>
          <List.Item icon={<IconSettings2 stroke={1.5} />}>
            Fully configurable.
          </List.Item>
        </List>
      </>
    ),
    docsUrl: "https://docs.sweetr.dev/features/pr-size-labeler",
    cover: "/pr-size-demo.png",
    isLive: false,
  },
];

export function Products() {
  const { classes, theme } = useStyles();

  return (
    <Container py="xl" mt={80}>
      <Center>
        <Paper
          bg="#111217"
          px={15}
          py={3}
          radius="xl"
          className={classes.githubPaper}
          withBorder
        >
          <Group spacing={5}>
            <IconBrandGithub stroke={1} />
            <Text tt="uppercase" fz="sm" fw={300}>
              GitHub App
            </Text>
          </Group>
        </Paper>
      </Center>

      <Title order={2} className={classes.title} ta="center" mt="sm">
        Improve Developer Experience
      </Title>
      <Text
        className={classes.description}
        ta="center"
        mt="md"
        fw={300}
        fz={18}
      >
        Supercharge your development workflow with quality-boosting tools that
        maximize productivity and promote best practices.
      </Text>

      <SimpleGrid
        cols={2}
        spacing={40}
        mt={60}
        breakpoints={[{ maxWidth: "md", cols: 1 }]}
      >
        {products.map((product) => (
          <ProductCard
            key={product.title}
            title={product.title}
            description={product.description}
            cover={product.cover}
            isLive={product.isLive}
            demoUrl={product.demoUrl}
            docsUrl={product.docsUrl}
          />
        ))}
      </SimpleGrid>
      <Box mt={40} ta="center">
        More coming soon.
        <br />
        <Anchor
          href="https://github.com/orgs/sweetr-dev/discussions/new/choose"
          target="_blank"
        >
          Have a question or a feature request? Let us know!
        </Anchor>
      </Box>
    </Container>
  );
}
