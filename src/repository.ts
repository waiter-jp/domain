// tslint:disable:max-classes-per-file completed-docs
/**
 * repository
 */
import { RedisRepository as PassportIssueUnitRepo } from './repo/passportIssueUnit';
import { InMemoryRepository as ProjectInMemoryRepo, MongoRepository as ProjectRepo } from './repo/project';
import { InMemoryRepository as RuleInMemoryRepo, MongoRepository as RuleRepo } from './repo/rule';

/**
 * 許可証発行単位リポジトリ
 */
export class PassportIssueUnit extends PassportIssueUnitRepo { }
/**
 * プロジェクトインメモリリポジトリ
 */
export class ProjectInMemory extends ProjectInMemoryRepo { }
/**
 * 発行規則インメモリリポジトリ
 */
export class RuleInMemory extends RuleInMemoryRepo { }
/**
 * プロジェクトリポジトリ
 */
export class Project extends ProjectRepo { }
/**
 * 発行規則リポジトリ
 */
export class Rule extends RuleRepo { }
