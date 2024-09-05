import { OauthV2AccessResponse } from "@slack/web-api";

export type SlackIntegrationData = Omit<
  OauthV2AccessResponse,
  "ok" | "error" | "response_metadata"
>;
