import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { graphql } from "@sweetr/graphql-types/frontend";
import { graphQLClient } from "./clients/graphql-client";
import {
  LoginToStripeMutation,
  LoginToStripeMutationVariables,
  PurchasablePlansQuery,
  PurchasablePlansQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";

export const usePurchasablePlansQuery = (
  args: PurchasablePlansQueryVariables,
  options?: Partial<UseQueryOptions<PurchasablePlansQuery>>,
) =>
  useQuery({
    queryKey: ["workspace", args.workspaceId, "purchasable-plans"],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query PurchasablePlans($workspaceId: SweetID!) {
            workspace(workspaceId: $workspaceId) {
              billing {
                purchasablePlans {
                  cloud {
                    monthly
                    yearly
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

export const useLoginToStripe = (
  options?: UseMutationOptions<
    LoginToStripeMutation,
    unknown,
    LoginToStripeMutationVariables,
    unknown
  >,
) =>
  useMutation({
    mutationFn: (args) =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          mutation LoginToStripe($input: LoginToStripeInput!) {
            loginToStripe(input: $input)
          }
        `),
        args,
      ),
    ...options,
  });
