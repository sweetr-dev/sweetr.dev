import {
  keepPreviousData,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import { SpotlightQuery } from "@sweetr/graphql-types/frontend/graphql";

export const useSpotlightQuery = (
  args: { workspaceId: string; query: string },
  options?: Partial<UseQueryOptions<SpotlightQuery>>,
) =>
  useQuery({
    queryKey: ["spotlight", args.workspaceId, args.query],
    placeholderData: keepPreviousData,
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query Spotlight(
            $workspaceId: SweetID!
            $peopleInput: PeopleQueryInput!
            $teamsInput: TeamsQueryInput!
            $repositoriesInput: RepositoriesQueryInput!
            $applicationsInput: ApplicationsQueryInput!
          ) {
            workspace(workspaceId: $workspaceId) {
              people(input: $peopleInput) {
                id
                avatar
                handle
                name
              }
              teams(input: $teamsInput) {
                id
                name
                description
                icon
                startColor
                endColor
              }
              repositories(input: $repositoriesInput) {
                id
                name
                fullName
              }
              applications(input: $applicationsInput) {
                id
                name
                description
              }
            }
          }
        `),
        {
          workspaceId: args.workspaceId,
          peopleInput: { query: args.query, limit: 5 },
          teamsInput: { query: args.query, limit: 5 },
          repositoriesInput: { query: args.query, limit: 5 },
          applicationsInput: { query: args.query, limit: 5 },
        },
      ),
    ...options,
  });
