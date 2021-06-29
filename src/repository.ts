// tslint:disable:max-classes-per-file completed-docs
/**
 * repository
 */
import { RedisRepository as PassportIssueUnitRepo } from './repo/passportIssueUnit';
import { InMemoryRepository as RuleInMemoryRepo, MongoRepository as RuleRepo } from './repo/rule';

/**
 * 許可証発行単位リポジトリ
 */
export class PassportIssueUnit extends PassportIssueUnitRepo { }
/**
 * 発行規則インメモリリポジトリ
 */
export class RuleInMemory extends RuleInMemoryRepo { }
/**
 * 発行規則リポジトリ
 */
export class Rule extends RuleRepo { }
