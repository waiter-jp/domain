/**
 * domain index
 */
import * as factory from '@waiter/factory';
import * as ioredis from 'ioredis';

import * as PassportService from './service/passport';

import { RedisRepository as PassportIssueUnitRepo } from './repo/passportIssueUnit';
import { InMemoryRepository as RuleRepo } from './repo/rule';

export import factory = factory;

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
export namespace repository {
    /**
     * 許可証発行単位レポジトリー
     */
    export class PassportIssueUnit extends PassportIssueUnitRepo { }
    /**
     * 発行ルールレポジトリー
     */
    export class Rule extends RuleRepo { }

}
export namespace service {
    export import passport = PassportService;
}
