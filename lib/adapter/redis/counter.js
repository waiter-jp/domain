"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * カウンターredisアダプター
 *
 * @class CounterRedisAdapter
 */
class CounterRedisAdapter {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
}
exports.default = CounterRedisAdapter;
