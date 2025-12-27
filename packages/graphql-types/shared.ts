import { Period } from "./api";

enum OAuthProvider {
  GITHUB = "GITHUB",
}

export interface GraphQLContext {
  workspaceId?: number;
  chartFilter?: {
    dateTimeRange: { from: string; to: string };
    period: Period;
    teamId: number;
  };
  currentToken: {
    gitProfileId: number;
    userId: number;
    oauthProvider: {
      provider: OAuthProvider;
      accessToken: string;
      tokenType: string;
      scope: string;
    };
  };
}

export enum ErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  BUSINESS_RULE = "BUSINESS_RULE",
  DATA_INTEGRITY = "DATA_INTEGRITY",
  UNAUTHENTICATED = "UNAUTHENTICATED",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  INPUT_VALIDATION_FAILED = "INPUT_VALIDATION_FAILED",
  DATA_ACCESS_ERROR = "DATA_ACCESS_ERROR",
  SUBSCRIPTION_REQUIRED = "SUBSCRIPTION_REQUIRED",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INTEGRATION_FAILED = "INTEGRATION_FAILED",
  UNKNOWN = "UNKNOWN",
}
