import { minutesToMilliseconds } from "date-fns";
import { env } from "../env";

export default {
  appId: env.GITHUB_APP_ID,
  privateKey: env.GITHUB_APP_PRIVATE_KEY,
  clientSecret: env.GITHUB_CLIENT_SECRET,
  clientId: env.GITHUB_CLIENT_ID,
  redirectPath: env.GITHUB_OAUTH_REDIRECT_PATH,
  scope: "read:user, user:email",
  failedWebhooks: {
    maxRetries: 3,
    repeatEveryMinutes: env.CRON_GITHUB_RETRY_FAILED_WEBHOOKS_EVERY_MINUTES,
    recentWebhooksTimeframe: minutesToMilliseconds(
      env.CRON_GITHUB_RETRY_FAILED_WEBHOOKS_EVERY_MINUTES + 5
    ),
  },
};
