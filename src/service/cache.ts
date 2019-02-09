/**
 * インメモリキャッシュサービス
 */
import { MongoRepository as ProjectRepo } from '../repo/project';
import { MongoRepository as RuleRepo } from '../repo/rule';

/**
 * インメモリデータストアを初期化する
 */
export function initializeInMemoryDataStore() {
    return async (repos: {
        project: ProjectRepo;
        rule: RuleRepo;
    }) => {
        process.env.WAITER_PROJECTS = JSON.stringify(await repos.project.search({}));
        process.env.WAITER_RULES = JSON.stringify(await repos.rule.search({}));
    };
}
