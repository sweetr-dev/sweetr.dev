import {
  MutationResolvers,
  QueryResolvers,
  Resolvers,
} from "@sweetr/graphql-types/api";

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
