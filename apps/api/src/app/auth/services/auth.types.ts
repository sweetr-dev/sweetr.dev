import { GitProvider } from "@prisma/client";

export interface Token {
  accessToken: string;
}

// TO-DO: Maybe use user slug instead of gitProfileId
export interface JWTPayload {
  gitProfileId: number;
  userId: number;
  gitProvider: {
    provider: GitProvider;
    accessToken: string;
    tokenType: string;
    scope: string;
  };
}
