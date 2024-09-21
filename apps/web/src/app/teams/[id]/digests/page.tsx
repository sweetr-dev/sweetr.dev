import { Image, SimpleGrid } from "@mantine/core";
import { useParams } from "react-router-dom";
import { ResourceNotFound } from "../../../../exceptions/resource-not-found.exception";
import { CardDigest } from "./components/card-digest";
import ImageWip from "./assets/wip.webp";
import ImageMetrics from "./assets/metrics.webp";

export const TeamDigestsPage = () => {
  const { teamId } = useParams();

  if (!teamId) throw new ResourceNotFound();

  return (
    <>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <CardDigest
          available={false}
          description="Summary of Pull Requests open or awaiting review."
          title="Work in Progress Digest"
          enabled={false}
          image={<Image src={ImageWip} />}
        />
        <CardDigest
          available={false}
          description="Summary of key metrics changes in the last period."
          title="Metrics Digest"
          enabled={false}
          image={<Image src={ImageMetrics} />}
        />
      </SimpleGrid>
    </>
  );
};
