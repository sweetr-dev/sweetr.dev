import { createGetInitialProps } from "@mantine/next";
import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";

const getInitialProps = createGetInitialProps() as (
  ctx: DocumentContext
) => Promise<DocumentInitialProps>;

export default class _Document extends Document {
  static getInitialProps = getInitialProps;

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
