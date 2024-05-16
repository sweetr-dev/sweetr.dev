import { env, isProduction } from "../env";

export default {
  jwt: {
    expiresIn: isProduction ? "1 day" : "365 days",
    secret: env.JWT_SECRET,
  },
};
