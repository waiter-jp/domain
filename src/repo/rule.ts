import * as createDebug from 'debug';

import * as errors from '../factory/errors';
import * as RuleFactory from '../factory/rule';

const debug = createDebug('waiter-domain:repository:rule');

/**
 * 許可証発行ルールローカルレポジトリー
 * 環境変数で許可証発行ルールを管理する場合のリポジトリークラス
 */
export class InMemoryRepository {
    public readonly rulesFromJson: RuleFactory.IRule[];

    constructor() {
        try {
            // 環境変数からルールを取得する
            const rules = JSON.parse(<string>process.env.WAITER_RULES);
            if (!Array.isArray(rules)) {
                throw new Error('WAITER_RULES must be an array.');
            }

            this.rulesFromJson = rules.map(RuleFactory.createFromObject);
        } catch (error) {
            throw new Error(`Please set an environment variable \`WAITER_RULES\` correctly. ${error.message}`);
        }
    }

    /**
     * 全ルールを取得する
     */
    public findAll(): RuleFactory.IRule[] {
        return this.rulesFromJson;
    }

    /**
     * スコープでルールを取得する
     * @param scope スコープ
     */
    public findbyScope(scope: string): RuleFactory.IRule {
        debug('finding a rule...', scope);
        const ruleFromJson = this.rulesFromJson.find((rule) => rule.scope === scope);
        if (ruleFromJson === undefined) {
            throw new errors.NotFound('rule');
        }
        debug('rule found.', ruleFromJson);

        return ruleFromJson;
    }
}
