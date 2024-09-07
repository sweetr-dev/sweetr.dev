import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { GraphQLContext } from "@sweetr/graphql-types/dist/shared";
import { createSchema, createYoga } from "graphql-yoga";
import { join } from "path";
import { authPlugin } from "./app/auth/resolvers/plugins/auth.plugin";
import { env } from "./env";
import { useSentry } from "./lib/use-sentry.plugin";

const resolvers = loadFilesSync(
  join(__dirname, "./**/*.(query|mutation|resolver).(js|ts)")
).map((r) => r[Object.keys(r)[0]]);

const typeDefs = loadFilesSync(join(__dirname, "./**/*.schema.*"));

const schema = createSchema<GraphQLContext>({
  typeDefs: mergeTypeDefs(typeDefs),
  resolvers: mergeResolvers(resolvers),
});

export const yoga = createYoga<GraphQLContext>({
  graphqlEndpoint: "/",
  schema,
  plugins: [authPlugin, useSentry()],
  graphiql: env.NODE_ENV === "development",
  landingPage: false,
  logging: false,
  cors: {
    origin: env.FRONTEND_URL,
    methods: ["*"],
    credentials: true,
  },
});
