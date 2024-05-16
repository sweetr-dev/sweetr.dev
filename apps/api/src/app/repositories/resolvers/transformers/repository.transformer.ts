import { Repository as DatabaseRepository } from "@prisma/client";
import { Repository as ApiRepository } from "@sweetr/graphql-types/dist/api";

export const transformRepository = (
  repository: DatabaseRepository
): ApiRepository => {
  return {
    id: repository.id,
    name: repository.name,
    fullName: repository.fullName,
  };
};
