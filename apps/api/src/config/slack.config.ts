import { env } from "../env";

export default {
  clientId: env.SLACK_CLIENT_ID,
  clientSecret: env.SLACK_CLIENT_SECRET,
  webhookSecret: env.SLACK_WEBHOOK_SECRET,
  scope:
    "app_mentions:read,channels:join,users.profile:read,users:read,users:read.email,chat:write,im:write",
};