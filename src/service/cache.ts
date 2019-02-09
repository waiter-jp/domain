/**
 * インメモリキャッシュサービス
 */
import { MongoRepository as ProjectRepo } from '../repo/project';
import { MongoRepository as RuleRepo } from '../repo/rule';

/**
 * インメモリデータストアを初期化する
 */
export /* istanbul ignore next */ function initializeInMemoryDataStore() {
    return async (repos: {
        project: ProjectRepo;
        rule: RuleRepo;
    }) => {
        const projects = await repos.project.search({});
        const rules = await repos.rule.search({});

        process.env.WAITER_PROJECTS = JSON.stringify(projects);
        process.env.WAITER_RULES = JSON.stringify(rules);
    };
}
