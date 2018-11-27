/**
 * domain index
 */
import * as ioredis from 'ioredis';

import * as factory from './factory';
import * as PassportService from './service/passport';

import { RedisRepository as PassportIssueUnitRepo } from './repo/passportIssueUnit';
import { InMemoryRepository as ProjectRepo } from './repo/project';
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
     * 許可証発行単位リポジトリ
     */
    export class PassportIssueUnit extends PassportIssueUnitRepo { }
    /**
     * プロジェクトリポジトリ
     */
    export class Project extends ProjectRepo { }
    /**
     * 発行ルールリポジトリ
     */
    export class Rule extends RuleRepo { }

}
export namespace service {
    export import passport = PassportService;
}
