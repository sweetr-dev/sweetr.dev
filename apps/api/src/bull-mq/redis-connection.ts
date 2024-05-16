import IORedis from "ioredis";
import { env } from "../env";

export const redisConnection = new IORedis(env.REDIS_CONNECTION_STRING, {
  maxRetriesPerRequest: null,
});
