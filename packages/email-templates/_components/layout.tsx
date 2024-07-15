import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface LayoutProps extends React.PropsWithChildren {
  preview: string;
}

export const Layout = ({ preview, children }: LayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="my-auto mx-auto font-sans px-2 bg-[#141517]">
          <Container className="my-[40px] mx-auto max-w-[500px]">
            <Section className="bg-[#1A1B1E] border border-solid border-[#373A40] rounded my-[80px] mx-auto p-[20px]">
              <Section className="mt-[8px]">
                <Img
                  src={`https://sweetr.dev/images/logo.png`}
                  height={40}
                  width={40}
                  alt="Sweetr"
                  className="my-0"
                />
              </Section>
              {children}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
