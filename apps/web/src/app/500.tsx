import { Title, Text } from "@mantine/core";
import { FC } from "react";
import classes from "./500.module.css";
import { PageContainer } from "../components/page-container";

export const ErrorPage: FC = () => {
  return (
    <PageContainer>
      <div className={classes.label}>500</div>
      <Title className={classes.title}>Something bad just happened...</Title>
      <Text size="lg" ta="center" className={classes.description}>
        Our servers could not handle your request. Don&apos;t worry, our
        development team was already notified. Try refreshing the page.
      </Text>
    </PageContainer>
  );
};
