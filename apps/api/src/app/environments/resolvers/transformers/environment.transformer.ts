import { Environment as DatabaseEnvironment } from "@prisma/client";
import { Environment as ApiEnvironment } from "../../../../graphql-types";

export const transformEnvironment = (
  environment: DatabaseEnvironment
): ApiEnvironment => {
  return {
    ...environment,
    archivedAt: environment.archivedAt?.toISOString(),
  };
};
