import { ApiKey } from "@prisma/client";
import { ApiKey as ApiApiKey } from "../../../../graphql-types";

export const transformApiKey = (
  apiKey: ApiKey
): Omit<ApiApiKey, "creator"> => ({
  ...apiKey,
  id: apiKey.id,
  name: apiKey.name,
  createdAt: apiKey.updatedAt.toISOString(), // We use the same record when regenerating the key
  lastUsedAt: apiKey.lastUsedAt?.toISOString(),
});
