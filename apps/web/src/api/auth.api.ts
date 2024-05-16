import {
  DefaultError,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  AuthProviderQuery,
  AuthProviderQueryVariables,
  LoginWithGithubMutation,
  MutationLoginWithGithubArgs,
} from "@sweetr/graphql-types/frontend/graphql";

export const useLoginWithGithubMutation = (
  options?: UseMutationOptions<
    LoginWithGithubMutation,
    DefaultError,
    MutationLoginWithGithubArgs
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation LoginWithGithub($input: LoginWithGithubInput!) {
            loginWithGithub(input: $input) {
              token {
                accessToken
              }
            }
          }
        `),
        args,
      ),
    ...options,
  });

export const useAuthProviderQuery = (
  args: AuthProviderQueryVariables,
  options?: UseQueryOptions<AuthProviderQuery>,
) =>
  useQuery({
    queryKey: ["authProvider"],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query AuthProvider($input: AuthProviderInput!) {
            authProvider(input: $input) {
              redirectUrl
            }
          }
        `),
        args,
      ),
    ...options,
  });
