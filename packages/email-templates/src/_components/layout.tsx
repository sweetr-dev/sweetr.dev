import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
  Link,
  Column,
  Row,
  Button,
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
        <Body className="my-auto mx-auto font-sans rounded-[4px]">
          <Section className=" bg-[#141517] pb-[40px] rounded-lg w-full mx-auto">
            <Container className="mx-auto max-w-[500px] px-2">
              <Section className="bg-[#1A1B1E] border-l rounded-b-xl border-b border-r border-solid border-[#373A40]  mx-auto p-[20px]">
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
              <Text className="text-zinc-400 text-xs mb-0">
                Tip: You can simply reply to this email to reach out to us.
              </Text>
              <Section className="pt-2">
                <table cellPadding={0} cellSpacing={0} border={0}>
                  <tr>
                    <td>
                      <Button
                        href="https://docs.sweetr.dev"
                        className="text-zinc-500 text-sm rounded pr-4"
                      >
                        Docs
                      </Button>
                    </td>
                    <td>
                      <Button
                        href="https://github.com/sweetr-dev/sweetr.dev"
                        className="text-zinc-500 text-sm rounded pr-4"
                      >
                        GitHub
                      </Button>
                    </td>
                    <td>
                      <Button
                        href="https://sweetr.featurebase.app"
                        className="text-zinc-500 text-sm rounded"
                      >
                        Give feedback
                      </Button>
                    </td>
                  </tr>
                </table>
              </Section>
            </Container>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
};
