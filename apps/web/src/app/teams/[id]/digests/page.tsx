import { Anchor, Image, SimpleGrid, Skeleton } from "@mantine/core";
import { Link, Outlet } from "react-router-dom";
import { CardDigest } from "./components/card-digest";
import { useDigestsCards } from "./use-digest-cards";
import { useDigests } from "./use-digests";
import { useTeamId } from "../use-team";
import { LoadableContent } from "../../../../components/loadable-content";

export const TeamDigestsPage = () => {
  const teamId = useTeamId();
  const { availableDigests, futureDigests } = useDigestsCards();
  const { digests, isLoading } = useDigests({ teamId });

  return (
    <>
      <LoadableContent
        isLoading={isLoading}
        whenLoading={
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <Skeleton h={387} />
            <Skeleton h={387} />
          </SimpleGrid>
        }
        content={
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            {availableDigests.map((digest) => (
              <Anchor
                key={digest.type}
                component={Link}
                to={digest.getRoute(teamId)}
                className="grow-on-hover"
                underline="never"
              >
                <CardDigest
                  available={true}
                  description={digest.description}
                  title={digest.title}
                  enabled={digests?.[digest.type]?.enabled || false}
                  image={<Image src={digest.imageUrl} />}
                />
              </Anchor>
            ))}

            {futureDigests.map((digest) => (
              <CardDigest
                key={digest.type}
                available={false}
                description={digest.description}
                title={digest.title}
                enabled={false}
                image={<Image src={digest.imageUrl} />}
              />
            ))}
          </SimpleGrid>
        }
      />
      <Outlet />
    </>
  );
};
