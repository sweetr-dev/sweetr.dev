import { graphql, HttpResponse } from "msw";
import { AlertType } from "@sweetr/graphql-types/frontend/graphql";

function mutationFieldKey(operationName: string, query: string): string {
  if (operationName) {
    return operationName.charAt(0).toLowerCase() + operationName.slice(1);
  }
  const m = query.match(/mutation[^{]*\{\s*(\w+)/);
  return m?.[1] ?? "noop";
}

function stubMutationPayload(
  field: string,
  variables: Record<string, unknown>,
): unknown {
  if (field === "regenerateApiKey") {
    return "sandbox_demo_api_key";
  }
  if (field === "updateAlert") {
    const input = (
      variables as {
        input?: { type?: AlertType; enabled?: boolean };
      }
    ).input;
    return {
      __typename: "Alert" as const,
      type: input?.type ?? AlertType.SLOW_REVIEW,
      enabled: input?.enabled ?? false,
    };
  }
  if (field === "scheduleSyncBatch") {
    return {
      __typename: "SyncBatch" as const,
      scheduledAt: new Date().toISOString(),
      finishedAt: null,
      sinceDaysAgo: 7,
    };
  }
  return {};
}

export const mutationHandlers = [
  graphql.mutation(/.+/, ({ operationName, query, variables }) => {
    const field = mutationFieldKey(operationName, query);
    return HttpResponse.json({
      data: { [field]: stubMutationPayload(field, variables) },
    });
  }),
];
