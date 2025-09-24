import {
  DefaultError,
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import { Optional } from "utility-types";
import {
  IncidentsQuery,
  IncidentsQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";

export const useIncidentsInfiniteQuery = (
  args: IncidentsQueryVariables,
  options: Optional<
    UseInfiniteQueryOptions<
      IncidentsQuery,
      DefaultError,
      InfiniteData<IncidentsQuery>
    >,
    "queryKey"
  >,
) =>
  useInfiniteQuery({
    queryKey: [
      "incidents",
      args.workspaceId,
      args.input.cursor,
      ...Object.values(args.input),
    ],
    queryFn: ({ pageParam }) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query Incidents(
            $workspaceId: SweetID!
            $input: IncidentsQueryInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              incidents(input: $input) {
                id
                team {
                  id
                  name
                  icon
                }
                leader {
                  id
                  name
                  avatar
                }
                detectedAt
                resolvedAt
                postmortemUrl
                archivedAt
                causeDeployment {
                  id
                  version
                  application {
                    id
                    name
                  }
                }
                fixDeployment {
                  id
                  version
                  application {
                    id
                    name
                  }
                }
              }
            }
          }
        `),
        { ...args, input: { ...args.input, cursor: pageParam as string } },
      ),
    ...options,
  });
