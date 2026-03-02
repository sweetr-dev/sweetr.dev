import { GitProvider } from "@prisma/client";

export interface UpsertGitProfileInput {
  gitProvider: GitProvider;
  gitUserId: string;
  handle: string;
  name: string;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
}
