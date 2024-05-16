import { Title, Text, Button, Container, Group } from "@mantine/core";
import { FC } from "react";
import { Link } from "react-router-dom";
import classes from "./404.module.css";

export const PageNotFound: FC = () => {
  return (
    <Container className={classes.root}>
      <div className={classes.label}>404</div>
      <Title className={classes.title}>You have found a secret place.</Title>

      <Text c="dimmed" size="lg" ta="center" className={classes.description}>
        Unfortunately, this is only a 404 page. You may have mistyped the
        address, or the page has been moved to another URL.
      </Text>

      <Group justify="center">
        <Link to={"/"}>
          <Button variant="subtle" size="md">
            Take me back to home page
          </Button>
        </Link>
      </Group>
    </Container>
  );
};
