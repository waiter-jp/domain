import * as redis from 'redis';
/**
 * カウンターredisアダプター
 *
 * @class CounterRedisAdapter
 */
export default class CounterRedisAdapter {
    readonly redisClient: redis.RedisClient;
    constructor(redisClient: redis.RedisClient);
}
