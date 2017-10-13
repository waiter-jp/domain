/**
 * waiter-domainモジュール
 * @module
 */

import * as redis from 'redis';

import * as PassportService from './service/passport';

import { InMemoryRepository as ClientRepo } from './repo/client';
import { RedisRepository as PassportCounterRepo } from './repo/passportCounter';

import ErrorCode from './factory/errorCode';
import * as PassportFactory from './factory/passport';

/**
 * Redis Cacheクライアント
 *
 * @example
 * const client = waiter.redis.createClient({
 *      host: process.env.REDIS_HOST,
 *      port: process.env.REDIS_PORT,
 *      password: process.env.REDIS_KEY,
 *      tls: { servername: process.env.TEST_REDIS_HOST }
 * });
 */
export import redis = redis;

export namespace repository {
    /**
     * 許可証カウンターレポジトリー
     * @export
     * @class
     */
    export class PassportCounter extends PassportCounterRepo { }
    /**
     * クライアントレポジトリー
     * @export
     * @class
     */
    export class Client extends ClientRepo { }

}

export namespace service {
    export import passport = PassportService;
}

export namespace factory {
    export import errorCode = ErrorCode;
    export import passport = PassportFactory;
}
