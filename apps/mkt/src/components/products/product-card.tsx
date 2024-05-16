import { FC, ReactNode } from "react";
import {
  Text,
  Card,
  Button,
  rem,
  Image,
  createStyles,
  Anchor,
  Box,
  Group,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconBook,
  IconExternalLink,
} from "@tabler/icons-react";

interface ProductCardProps {
  title: string;
  description: string | ReactNode;
  cover: string;
  isLive: boolean;
  docsUrl: string;
  demoUrl?: string;
}

const useStyles = createStyles((theme) => ({
  card: {
    border: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
    backgroundColor: `${
      theme.colorScheme === "dark" ? "#111217" : theme.colors.gray[1]
    }`,
  },

  cardImage: {
    background: "#0d1117",

    "&:hover .cardImageHover": {
      opacity: 1,
    },
  },
  cardImageHover: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 350,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
    opacity: 0,
    transition: "opacity 200ms ease",
    fontSize: rem(18),
    color: theme.colorScheme === "dark" ? "#fff" : "#000",
    fontWeight: 700,

    "&:hover": {
      opacity: 1,
    },
  },

  cardTitle: {
    "&::after": {
      content: '""',
      display: "block",
      backgroundColor: theme.fn.primaryColor(),
      width: rem(45),
      height: rem(2),
      marginTop: theme.spacing.sm,
    },
  },
}));
export const ProductCard: FC<ProductCardProps> = ({
  title,
  cover,
  description,
  isLive,
  demoUrl,
  docsUrl,
}) => {
  const { classes } = useStyles();

  return (
    <Card key={title} shadow="md" className={classes.card} padding="xl">
      <Card.Section className={classes.cardImage}>
        <Image src={cover} height={350} alt={title} fit="contain" />
        {demoUrl && (
          <>
            <Anchor target="_blank" href={demoUrl}>
              <Box className={classes.cardImageHover}>
                See demo{" "}
                <IconExternalLink
                  size={16}
                  stroke={2.5}
                  style={{ marginLeft: 5 }}
                />
              </Box>
            </Anchor>
          </>
        )}
        {!demoUrl && (
          <>
            <Box className={classes.cardImageHover}>Coming soon</Box>
          </>
        )}
      </Card.Section>
      <Group position="apart">
        <Title order={2} fz="lg" fw={500} className={classes.cardTitle} mt="md">
          {title}
        </Title>
        {demoUrl && (
          <Anchor target="_blank" href={demoUrl}>
            Demo <IconExternalLink size={14} stroke={1.5} />
          </Anchor>
        )}
      </Group>
      <Box mb={24} mt="sm">
        <Text fz="sm" c="dimmed">
          {description}
        </Text>
      </Box>
      <Group noWrap>
        <Button
          fullWidth
          variant="light"
          color="gray.1"
          leftIcon={<IconBook />}
          href={docsUrl}
          target="_blank"
          component="a"
        >
          Read Docs
        </Button>
        {isLive && (
          <Button
            fullWidth
            variant="filled"
            leftIcon={<IconArrowRight />}
            href="https://github.com/apps/sweetr-dev/installations/new"
            target="_blank"
            component="a"
          >
            Get it for free
          </Button>
        )}

        {!isLive && (
          <Button fullWidth variant="light" disabled>
            Coming soon
          </Button>
        )}
      </Group>
    </Card>
  );
};
