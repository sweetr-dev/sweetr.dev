import IORedis from "ioredis";
import { env } from "../env";

let redisConnection: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (!redisConnection) {
    redisConnection = new IORedis(env.REDIS_CONNECTION_STRING, {
      maxRetriesPerRequest: null,
    });
  }

  return redisConnection;
}
