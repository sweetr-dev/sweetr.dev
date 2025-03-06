// This is sourced from https://github.com/n1ru4l/envelop/blob/2a175b476a47d17225946277ff00f0a90ae50044/packages/plugins/sentry/src/index.ts
// Customized so that
// - we use our own custom captureException
// - we remove "extra" from the error

import {
  Plugin,
  handleStreamOrSingleExecutionResult,
  OnExecuteDoneHookResultOnNextHook,
  isOriginalGraphQLError,
} from "@envelop/core";
import {
  Scope,
  getCurrentScope,
  startInactiveSpan,
  withScope,
} from "@sentry/node";
import {
  ExecutionArgs,
  GraphQLError,
  Kind,
  OperationDefinitionNode,
  print,
} from "graphql";
import { captureException } from "./sentry";

interface TraceparentData {
  /**
   * Trace ID
   */
  traceId?: string | undefined;
  /**
   * Parent Span ID
   */
  parentSpanId?: string | undefined;
  /**
   * If this transaction has a parent, the parent's sampling decision
   */
  parentSampled?: boolean | undefined;
}

export type SentryPluginOptions = {
  /**
   * Adds result of each resolver and operation to Span's data (available under "result")
   * @default false
   */
  includeRawResult?: boolean;
  /**
   * Adds arguments of each resolver to Span's tag called "args"
   * @default false
   */
  includeResolverArgs?: boolean;
  /**
   * Adds operation's variables to a Scope (only in case of errors)
   * @default false
   */
  includeExecuteVariables?: boolean;
  /**
   * The key of the event id in the error's extension. `null` to disable.
   * @default sentryEventId
   */
  eventIdKey?: string | null;
  /**
   * Callback to set context information onto the scope.
   */
  configureScope?: (args: ExecutionArgs, scope: Scope) => void;
  /**
   * Produces a name of Transaction (only when "renameTransaction" or "startTransaction" are enabled) and description of created Span.
   *
   * @default operation's name or "Anonymous Operation" when missing)
   */
  transactionName?: (args: ExecutionArgs) => string;
  /**
   * Produces tracing data for Transaction
   *
   * @default is empty
   */
  traceParentData?: (args: ExecutionArgs) => TraceparentData | undefined;
  /**
   * Produces a "op" (operation) of created Span.
   *
   * @default execute
   */
  operationName?: (args: ExecutionArgs) => string;
  /**
   * Indicates whether or not to skip the entire Sentry flow for given GraphQL operation.
   * By default, no operations are skipped.
   */
  skip?: (args: ExecutionArgs) => boolean;
  /**
   * Indicates whether or not to skip Sentry exception reporting for a given error.
   * By default, this plugin skips all `GraphQLError` errors and does not report it to
   */
  skipError?: (args: Error) => boolean;
};

export const defaultSkipError = isOriginalGraphQLError;

export const useSentry = (options: SentryPluginOptions = {}): Plugin => {
  function pick<K extends keyof SentryPluginOptions>(
    key: K,
    defaultValue: NonNullable<SentryPluginOptions[K]>
  ) {
    return options[key] ?? defaultValue;
  }

  const includeRawResult = pick("includeRawResult", false);
  const includeExecuteVariables = pick("includeExecuteVariables", false);
  const skipOperation = pick("skip", () => false);
  const skipError = pick("skipError", defaultSkipError);

  const printedDocumentsCache = new WeakMap<any, string>();

  const eventIdKey = options.eventIdKey === null ? null : "sentryEventId";

  function addEventId(err: GraphQLError, eventId: string | null): GraphQLError {
    if (eventIdKey !== null && eventId !== null) {
      err.extensions[eventIdKey] = eventId;
    }

    return err;
  }

  return {
    onExecute({ args }) {
      if (skipOperation(args)) {
        return undefined;
      }

      const rootOperation = args.document.definitions.find(
        (o) => o.kind === Kind.OPERATION_DEFINITION
      ) as OperationDefinitionNode;
      const operationType = rootOperation.operation;

      let document = printedDocumentsCache.get(args.document);
      if (!document) {
        document = print(args.document);
        printedDocumentsCache.set(args.document, document);
      }

      const opName =
        args.operationName ||
        rootOperation.name?.value ||
        "Anonymous Operation";
      const traceparentData =
        (options.traceParentData && options.traceParentData(args)) || {};

      const transactionName = options.transactionName
        ? options.transactionName(args)
        : opName;
      const op = options.operationName
        ? options.operationName(args)
        : "execute";
      const tags = {
        operationName: opName,
        operation: operationType,
      };

      const rootSpan = startInactiveSpan({
        name: transactionName,
        op,
        attributes: tags,
        ...traceparentData,
      });

      if (!rootSpan) {
        const error = [
          `Could not create the root Sentry transaction for the GraphQL operation "${transactionName}".`,
          `It's very likely that this is because you have not included the Sentry tracing SDK in your app's runtime before handling the request.`,
        ];

        throw new Error(error.join("\n"));
      }

      getCurrentScope().clearBreadcrumbs();

      rootSpan.setAttribute("document", document);

      return {
        onExecuteDone(payload) {
          const handleResult: OnExecuteDoneHookResultOnNextHook<
            Record<string, unknown>
          > = ({ result, setResult }) => {
            if (includeRawResult) {
              rootSpan.setAttribute("result", JSON.stringify(result));
            }

            if (result.errors && result.errors.length > 0) {
              withScope((scope) => {
                scope.setTransactionName(opName);
                scope.setTag("operation", operationType);
                scope.setTag("operationName", opName);
                scope.setExtra("document", document);

                if (includeRawResult) {
                  scope.setExtra("result", result);
                }

                if (includeExecuteVariables) {
                  scope.setExtra("variables", args.variableValues);
                }

                const errors = result.errors?.map((err) => {
                  if (skipError(err) === true) {
                    return err;
                  }

                  const errorPath = (err.path ?? [])
                    .map((v: string | number) =>
                      typeof v === "number" ? "$index" : v
                    )
                    .join(" > ");

                  if (errorPath) {
                    scope.addBreadcrumb({
                      category: "execution-path",
                      message: errorPath,
                      level: "debug",
                    });
                  }

                  const eventId = captureException(err.originalError, {
                    fingerprint: ["graphql", errorPath, opName, operationType],
                    contexts: {
                      GraphQL: {
                        operationName: opName,
                        operationType,
                        variables: args.variableValues,
                      },
                    },
                  });

                  delete err.extensions.severity;
                  delete err.extensions.extra;

                  return addEventId(err, eventId);
                });

                setResult({
                  ...result,
                  errors,
                });
              });
            }

            rootSpan.end();
          };
          return handleStreamOrSingleExecutionResult(payload, handleResult);
        },
      };
    },
  };
};
