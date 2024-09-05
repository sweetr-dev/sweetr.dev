import { WebClient } from "@slack/web-api";

let slackClient: WebClient | null;

export const getSlackWebClient = (token?: string): WebClient => {
  if (slackClient && slackClient.token === token) return slackClient;

  return new WebClient(token);
};
