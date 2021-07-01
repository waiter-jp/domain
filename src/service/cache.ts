/**
 * インメモリキャッシュサービス
 */
import { MongoRepository as RuleRepo } from '../repo/rule';

/**
 * インメモリデータストアを初期化する
 */
export function initializeInMemoryDataStore() {
    return async (repos: {
        rule: RuleRepo;
    }) => {
        process.env.WAITER_RULES = JSON.stringify(await repos.rule.search({}));
    };
}
