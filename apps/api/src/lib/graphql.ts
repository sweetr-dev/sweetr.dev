import { MutationResolvers, QueryResolvers, Resolvers } from "../graphql-types";

export const createQueryResolver = (resolvers: QueryResolvers): Resolvers => {
  return {
    Query: {
      ...resolvers,
    },
  };
};

export const createMutationResolver = (
  resolvers: MutationResolvers
): Resolvers => {
  return {
    Mutation: {
      ...resolvers,
    },
  };
};

export const createFieldResolver = <T extends keyof Resolvers>(
  key: T,
  resolvers: Resolvers[T]
): Resolvers => {
  return {
    [key]: {
      ...resolvers,
    },
  };
};
