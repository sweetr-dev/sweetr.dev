import {
  DefaultError,
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  PeopleQueryVariables,
  PeopleQuery,
  PersonQuery,
  PersonQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";
import { Optional } from "utility-types";

export const usePeopleInfiniteQuery = (
  args: PeopleQueryVariables,
  options: Optional<
    UseInfiniteQueryOptions<
      PeopleQuery,
      DefaultError,
      InfiniteData<PeopleQuery>
    >,
    "queryKey"
  >,
) =>
  useInfiniteQuery({
    queryKey: ["people", args.workspaceId],
    queryFn: ({ pageParam }) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query People($workspaceId: SweetID!, $input: PeopleQueryInput) {
            workspace(workspaceId: $workspaceId) {
              people(input: $input) {
                id
                name
                handle
                avatar
              }
            }
          }
        `),
        { ...args, input: { ...args.input, cursor: pageParam as string } },
      ),
    ...options,
  });

export const usePeopleOptionsQuery = (
  args: PeopleQueryVariables,
  options?: Partial<UseQueryOptions<PeopleQuery>>,
) =>
  useQuery({
    queryKey: ["people", args.workspaceId, "search", args.input?.query],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query People($workspaceId: SweetID!, $input: PeopleQueryInput) {
            workspace(workspaceId: $workspaceId) {
              people(input: $input) {
                id
                name
                handle
                avatar
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const usePersonQuery = (
  args: PersonQueryVariables,
  options?: Partial<UseQueryOptions<PersonQuery>>,
) =>
  useQuery({
    queryKey: ["person", args.workspaceId, args.handle],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query Person($workspaceId: SweetID!, $handle: String!) {
            workspace(workspaceId: $workspaceId) {
              person(handle: $handle) {
                id
                name
                handle
                avatar
                teamMemberships {
                  id
                  role
                  team {
                    id
                    name
                    icon
                  }
                }
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });
