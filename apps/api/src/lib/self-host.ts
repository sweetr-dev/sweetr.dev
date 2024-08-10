import { env } from "../env";

export const isAppSelfHosted = (): boolean => {
  return env.APP_MODE === "self-hosted";
};
