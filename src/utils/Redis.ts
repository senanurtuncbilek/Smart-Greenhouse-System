import { createClient } from "redis";

const host = process.env.REDIS_HOST || "localhost";
const port = process.env.REDIS_PORT || "6379";
const url = process.env.REDIS_URL || `redis://${host}:${port}`;

const redis = createClient({ url });

redis.on("error", (err) => console.error("Redis error:", err));
redis.connect();

export default redis;