import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { Layout } from "../_components/layout";

interface InitialSyncCompleteprops {
  username: string;
  createTeamLink: string;
}

export const InitialSyncCompleteEmail = ({
  username,
  createTeamLink = "https://app.sweetr.dev/teams",
}: InitialSyncCompleteprops) => {
  return (
    <Layout preview="Your workspace data is ready.">
      <Heading className="text-zinc-100 text-[24px] font-normal p-0 mt-[30px] mx-0">
        Your workspace data is ready.
      </Heading>
      <Text className="text-zinc-300 text-[14px]">Hello {username},</Text>
      <Text className="text-zinc-300 text-[14px] ">
        Your GitHub metadata is now fully synced with Sweetr. Create a team to
        explore insights from your data and get the most out of Sweetr.
      </Text>
      <Section className="text-center mt-[32px] mb-[12px]">
        <Button
          className="bg-green-400 rounded text-black text-[12px] font-semibold no-underline text-center px-8 py-3"
          href={createTeamLink}
        >
          Create a team
        </Button>
      </Section>
    </Layout>
  );
};

InitialSyncCompleteEmail.PreviewProps = {
  username: "John Doe",
} as InitialSyncCompleteprops;

export default InitialSyncCompleteEmail;
