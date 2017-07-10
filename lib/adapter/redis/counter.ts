import * as redis from 'redis';

/**
 * カウンターredisアダプター
 *
 * @class CounterRedisAdapter
 */
export default class CounterRedisAdapter {
    public readonly redisClient: redis.RedisClient;

    constructor(redisClient: redis.RedisClient) {
        this.redisClient = redisClient;
    }
}
