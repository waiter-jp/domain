/**
 * domain index
 */
import * as ioredis from 'ioredis';

import * as factory from './factory';
import * as repository from './repository';
import * as service from './service';

/**
 * Redis Cacheクライアント
 * @example
 * const client = new waiter.redis({
 *      host: process.env.REDIS_HOST,
 *      port: process.env.REDIS_PORT,
 *      password: process.env.REDIS_KEY,
 *      tls: { servername: process.env.TEST_REDIS_HOST }
 * });
 */
export import redis = ioredis;

export import factory = factory;
export import repository = repository;
export import service = service;
