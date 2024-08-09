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
  BillingQuery,
  BillingQueryVariables,
} from "@sweetr/graphql-types/frontend/graphql";

export const useBillingQuery = (
  args: BillingQueryVariables,
  options?: Partial<UseQueryOptions<BillingQuery>>,
) =>
  useQuery({
    queryKey: ["workspace", args.workspaceId, "purchasable-plans"],
    queryFn: () =>
      graphQLClient.request(
        graphql(/* GraphQL */ `
          query Billing($workspaceId: SweetID!) {
            workspace(workspaceId: $workspaceId) {
              billing {
                purchasablePlans {
                  cloud {
                    monthly
                    yearly
                  }
                }
                estimatedSeats
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
